import prisma from "../prismaClient.js";
import { CategoryType } from "@prisma/client";
import { v4 as uuid } from "uuid";

/** helper: shape record for the front-end */
const flatten = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category.categoryDefinition.name,
  date: row.date,
  amount: row.amount,
  recurring: row.recurring,
  recurringId: row.recurringId,
  theme: row.theme,
});

/**
 * Get all transactions - GET '/api/transactions'
 */
export const getTransactions = async (req, res) => {
  const {
    page = 1,
    pageSize = 10,
    month,
    q,
    catId,
    sort = "latest",
  } = req.query;
  const skip = (+page - 1) * +pageSize;
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
  if (month && month !== "all") {
    const [m, y] = month.split("-"); // 2025-05 (zero-pad month)
    where.date = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
  }
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (catId) where.userCategoryId = catId;

  const [rows, count] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      orderBy: order,
      skip,
      take: +pageSize,
      include: { category: { include: { categoryDefinition: true } } },
    }),
    prisma.transaction.count({ where }),
  ]);

  res.json({ data: rows.map(flatten), total: count });
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
          categoryDefinition: {
            name: {
              in: categoryNames,
            },
          },
        },
      },
      include: {
        category: {
          include: {
            categoryDefinition: true,
          },
        },
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
      const name = txn.category?.categoryDefinition?.name;
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
    userCategoryId,
    date,
    amount,
    recurring = false,
    recurringId,
    dueDate,
  } = req.body;

  // verify category belongs to this user
  const link = await prisma.userCategory.findUnique({
    where: { id: userCategoryId },
    select: { id: true, userId: true },
  });
  if (!link || link.userId !== req.userId)
    return res.status(400).json({ msg: "Bad category" });

  let billId = recurringId;

  const result = await prisma.$transaction(async (tx) => {
    // create / update recurring bill if needed
    if (recurring) {
      if (!billId || billId === "new") {
        const bill = await tx.recurringBill.create({
          data: {
            id: uuid(),
            userId: req.userId,
            name,
            category: link, // category string no longer stored; keep theme separately
            userCategoryId: link.id,
            amount: -Math.abs(amount),
            dueDate,
            lastPaid: date,
            theme: req.body.theme || "#8884d8",
            recurring: true,
          },
        });
        billId = bill.id;
      } else {
        await tx.recurringBill.update({
          where: { id: billId, userId: req.userId },
          data: { lastPaid: date },
        });
      }
    }

    // insert transaction
    const txn = await tx.transaction.create({
      data: {
        id: uuid(),
        userId: req.userId,
        userCategoryId: link.id,
        name,
        date,
        amount: recurring ? -Math.abs(amount) : amount,
        recurring,
        recurringId: billId,
        theme: req.body.theme || "#8884d8",
      },
      include: { category: { include: { categoryDefinition: true } } },
    });

    // update balance atomically
    await tx.balance.update({
      where: { userId: req.userId },
      data: {
        current: { increment: txn.amount },
        income: txn.amount > 0 ? { increment: txn.amount } : undefined,
        expenses:
          txn.amount < 0 ? { increment: Math.abs(txn.amount) } : undefined,
      },
    });

    return txn;
  });

  res.status(201).json(flatten(result));
};

/**
 * Update a transaction - PUT '/api/transactions/:id'
 */
export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    userCategoryId,
    date,
    amount,
    recurring,
    recurringId,
    dueDate,
  } = req.body;

  const original = await prisma.transaction.findUnique({ where: { id } });
  if (!original || original.userId !== req.userId) return res.sendStatus(404);

  const link = await prisma.userCategory.findUnique({
    where: { id: userCategoryId },
    select: { id: true, userId: true },
  });
  if (!link || link.userId !== req.userId)
    return res.status(400).json({ msg: "Bad category" });

  const diff = amount - original.amount; // +/- for balance adjustment

  const updated = await prisma.$transaction(async (tx) => {
    // recurring bill housekeeping similar to create…
    let billId = recurringId;
    if (recurring) {
      if (!billId || billId === "new") {
        const bill = await tx.recurringBill.create({
          data: {
            id: uuid(),
            userId: req.userId,
            name,
            userCategoryId: link.id,
            amount: -Math.abs(amount),
            dueDate,
            lastPaid: date,
            theme: original.theme,
          },
        });
        billId = bill.id;
      } else {
        await tx.recurringBill.update({
          where: { id: billId, userId: req.userId },
          data: { lastPaid: date },
        });
      }
    }

    const row = await tx.transaction.update({
      where: { id },
      data: {
        name,
        userCategoryId: link.id,
        date,
        amount,
        recurring,
        recurringId: billId,
      },
      include: { category: { include: { categoryDefinition: true } } },
    });

    await tx.balance.update({
      where: { userId: req.userId },
      data: {
        current: { increment: diff },
        income:
          diff > 0
            ? { increment: diff }
            : diff < 0 && original.amount > 0
            ? { decrement: Math.abs(diff) }
            : undefined,
        expenses:
          diff < 0
            ? { increment: Math.abs(diff) }
            : diff > 0 && original.amount < 0
            ? { decrement: diff }
            : undefined,
      },
    });

    return row;
  });

  res.json(flatten(updated));
};

/**
 * Delete a transaction - DELETE '/api/transactions/:id'
 */
export const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  const txn = await prisma.transaction.findUnique({ where: { id } });
  if (!txn || txn.userId !== req.userId) return res.sendStatus(404);

  await prisma.$transaction(async (tx) => {
    await tx.transaction.delete({ where: { id } });

    // balance reverse
    await tx.balance.update({
      where: { userId: req.userId },
      data: {
        current: { decrement: txn.amount },
        income: txn.amount > 0 ? { decrement: txn.amount } : undefined,
        expenses:
          txn.amount < 0 ? { decrement: Math.abs(txn.amount) } : undefined,
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
};
