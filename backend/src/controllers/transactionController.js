import prisma from "../prismaClient.js";
import { v4 as uuid } from "uuid";

const txSelect = {
  id: true,
  name: true,
  amount: true,
  date: true,
  theme: true,
  recurring: true,
  recurringId: true,
  category: { select: { name: true } },
};

/** helper: shape record for the front-end */
const flatten = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category.name,
  date: row.date,
  amount: row.amount,
  recurring: row.recurring || false,
  recurringId: row.recurringId || null,
  theme: row.theme,
});

/**
 * Get all transactions - GET '/api/transactions'
 */
export const getTransactions = async (req, res) => {
  const {
    page = 1,
    month = "All",
    searchName,
    category = "All Transactions",
    sort = "latest",
  } = req.query;

  try {
    const pageNumber = Number(page) || 1;
    const skip = (pageNumber - 1) * 10;

    const order =
      sort === "latest"
        ? [{ date: "desc" }]
        : sort === "oldest"
        ? [{ date: "asc" }]
        : sort === "highest"
        ? [{ amount: "desc" }]
        : sort === "lowest"
        ? [{ amount: "asc" }]
        : [{ date: "desc" }];

    const where = { userId: req.userId };

    if (month && month.toLowerCase() !== "all") {
      const [monthName, yearStr] = month.split(" ");
      // dummy year to get index
      const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
      const year = Number(yearStr);

      where.date = {
        gte: new Date(year, monthIndex, 1),
        lt: new Date(year, monthIndex + 1, 1),
      };
    }

    if (searchName) where.name = { contains: searchName, mode: "insensitive" };

    if (category && category !== "All Transactions") {
      const catDef = await prisma.categoryDefinition.findFirst({
        where: {
          name: category,
          OR: [{ creatorId: null }, { creatorId: req.userId }],
        },
        select: { id: true },
      });

      if (!catDef) {
        return res.status(404).json({ message: `Category not found.` });
      }

      where.categoryDefinitionId = catDef.id;
    }

    const [rows, count] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        orderBy: order,
        skip,
        take: 10,
        select: txSelect,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      data: rows.map(flatten),
      total: count,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get single transaction - GET '/api/transactions/:id'
 */
export const getTransaction = async (req, res) => {
  const row = await prisma.transaction.findUnique({
    where: { id: req.params.id },
    include: { category: { include: { categoryDefinition: true } } },
  });

  if (!row || row.userId !== req.userId) {
    return res.status(404).json({ message: "Transaction not found." });
  }

  res.json(flatten(row));
};

// Get transaction per category for budgets for particular month - POST /api/transactions/budgetCategories
export const getMonthlyTransactionsByCategoryNames = async (req, res) => {
  const userId = req.userId;
  const { categoryNames, month } = req.body;

  if (!Array.isArray(categoryNames) || typeof month !== "string") {
    return res.status(400).json({ message: "Invalid request payload" });
  }

  if (categoryNames.length === 0) {
    return res.status(201).json({});
  }

  try {
    const start = new Date(`${month}-01T00:00:00Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1); // Exclusive upper bound

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lt: end,
        },
        category: {
          name: {
            in: categoryNames,
          },
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    // Group transactions by category name
    const grouped = categoryNames.reduce((acc, name) => {
      acc[name] = [];
      return acc;
    }, {});

    for (const txn of transactions) {
      const name = txn.category?.name;
      if (name && grouped[name]) {
        grouped[name].push(txn);
      }
    }

    return res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Create a transaction - POST '/api/transactions'
 */
export const createTransaction = async (req, res) => {
  const {
    name,
    category,
    date,
    amount,
    recurring = false,
    recurringId = null,
    dueDate,
    theme,
  } = req.body;
  const userId = req.userId;

  if (
    !name?.trim() ||
    !category?.trim() ||
    isNaN(Number(amount)) ||
    !date?.trim() ||
    !theme?.trim()
  )
    return res.status(400).json({ message: "Invalid payload" });

  try {
    const catDef = await prisma.categoryDefinition.findFirst({
      where: {
        name: category,
        OR: [{ creatorId: null }, { creatorId: userId }],
      },
      select: { id: true },
    });

    if (!catDef) {
      return res.status(404).json({ message: " Category not found. " });
    }

    const updated = await prisma.$transaction(async (tx) => {
      let billId = recurringId;

      if (recurring && (!billId || billId === "new")) {
        const bill = await tx.recurringBill.create({
          data: {
            userId,
            name,
            categoryDefinitionId: catDef.id,
            amount: -Math.abs(amount),
            dueDate,
            lastPaid: new Date(date),
            theme: theme,
          },
        });
        billId = bill.id;
      }

      const row = await tx.transaction.create({
        data: {
          name,
          categoryDefinitionId: catDef.id,
          date: new Date(date),
          amount,
          recurring,
          recurringId: recurring ? billId : null,
        },
        select: txSelect,
      });

      await tx.balance.update({
        where: { userId },
        data: {
          current: { increment: amount },
          income: amount > 0 ? { increment: amount } : undefined,
          expenses: amount < 0 ? { increment: amount } : undefined,
        },
      });

      // Always update the lastPaid of the related recurring bill (new or old)
      const targetRecurringId = billId;

      if (targetRecurringId) {
        const latest = await tx.transaction.findFirst({
          where: { recurringId: targetRecurringId, userId },
          orderBy: { date: "desc" },
          select: { date: true },
        });

        await tx.recurringBill.update({
          where: { id: targetRecurringId, userId },
          data: { lastPaid: latest?.date ?? null },
        });
      }

      return row;
    });

    res.status(201).json(flatten(updated));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update a transaction - PUT '/api/transactions/:id'
 */
export const updateTransaction = async (req, res) => {
  const txId = req.params.id;
  const { name, category, date, amount, recurring, recurringId, dueDate } =
    req.body;
  const userId = req.userId;

  if (!name?.trim() || !category?.trim() || isNaN(Number(amount)) || !date)
    return res.status(400).json({ message: "Invalid payload" });

  try {
    const original = await prisma.transaction.findFirst({
      where: { id: txId, userId: userId },
    });

    if (!original) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    const catDef = await prisma.categoryDefinition.findFirst({
      where: {
        name: category,
        OR: [{ creatorId: null }, { creatorId: userId }],
      },
      select: { id: true },
    });

    if (!catDef) {
      return res.status(404).json({ message: " Category not found. " });
    }

    const updated = await prisma.$transaction(async (tx) => {
      let billId = recurringId;

      if (recurring && (!billId || billId === "new")) {
        const bill = await tx.recurringBill.create({
          data: {
            userId,
            name,
            categoryDefinitionId: catDef.id,
            amount: -Math.abs(amount),
            dueDate,
            lastPaid: new Date(date),
            theme: original.theme,
          },
        });
        billId = bill.id;
      }

      const row = await tx.transaction.update({
        where: { id: txId },
        data: {
          name,
          categoryDefinitionId: catDef.id,
          date: new Date(date),
          amount,
          recurring,
          recurringId: recurring ? billId : null,
        },
        select: txSelect,
      });

      const diff = amount - original.amount; // +/- for balance adjustment

      await tx.balance.update({
        where: { userId },
        data: {
          current: { increment: diff },
          income:
            diff > 0
              ? { increment: diff }
              : original.amount > 0
              ? { decrement: -diff }
              : undefined,
          expenses:
            diff < 0
              ? { increment: Math.abs(diff) }
              : original.amount < 0
              ? { increment: diff }
              : undefined,
        },
      });

      // Always update the lastPaid of the related recurring bill (new or old)
      const targetRecurringId = billId;

      if (targetRecurringId) {
        const latest = await tx.transaction.findFirst({
          where: { recurringId: targetRecurringId, userId },
          orderBy: { date: "desc" },
          select: { date: true },
        });

        await tx.recurringBill.update({
          where: { id: targetRecurringId, userId },
          data: { lastPaid: latest?.date ?? null },
        });
      }

      return row;
    });

    res.status(200).json(flatten(updated));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete a transaction - DELETE '/api/transactions/:id'
 */
export const deleteTransaction = async (req, res) => {
  const txId = req.params.id;
  const userId = req.userId;

  try {
    const txn = await prisma.transaction.findFirst({
      where: { id: txId, userId },
      select: {
        id: true,
        amount: true,
        recurring: true,
        recurringId: true,
        date: true,
      },
    });

    if (!txn) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.transaction.delete({ where: { id: txId } });

      const isIncome = txn.amount > 0;

      // balance reverse
      await tx.balance.update({
        where: { userId: userId },
        data: {
          current: { decrement: txn.amount },
          income: isIncome ? { decrement: txn.amount } : undefined,
          expenses: !isIncome ? { decrement: Math.abs(txn.amount) } : undefined,
        },
      });

      // recurring-bill lastPaid update (look for newest remaining txn)
      if (txn.recurring && txn.recurringId) {
        const latest = await tx.transaction.findFirst({
          where: { recurringId: txn.recurringId },
          orderBy: { date: "desc" },
        });
        await tx.recurringBill.update({
          where: { id: txn.recurringId, userId: req.userId },
          data: { lastPaid: latest?.date ?? null },
        });
      }
    });

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
