import prisma from "../prismaClient.js";

/* selection helper */
const billSelect = {
  id: true,
  name: true,
  category: {
    select: { name: true },
  },
  amount: true,
  dueDate: true,
  lastPaid: true,
  theme: true,
};

/* GET /api/bills?search=&sort */
export const getBills = async (req, res) => {
  try {
    const where = {
      userId: req.userId,
    };

    const raw = await prisma.recurringBill.findMany({
      where,
      select: billSelect,
    });

    const bills = raw.map((b) => {
      const categoryName = b.category?.name;

      return {
        id: b.id,
        name: b.name,
        amount: b.amount,
        dueDate: b.dueDate,
        lastPaid: b.lastPaid,
        theme: b.theme,
        category: categoryName,
      };
    });

    res.json(bills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET /api/bills/:id */
export const getBill = async (req, res) => {
  try {
    const raw = await prisma.recurringBill.findFirst({
      where: { id: req.params.id, userId: req.userId },
      select: billSelect,
    });
    if (!raw) return res.status(404).json({ message: "Not found" });

    const categoryName = raw.category?.name;

    return res.json({
      id: raw.id,
      name: raw.name,
      amount: raw.amount,
      dueDate: raw.dueDate,
      lastPaid: raw.lastPaid,
      theme: raw.theme,
      category: categoryName,
    });
  } catch (err) {
    console.log("single bill fetching error : ", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* POST /api/bills */
export const addBill = async (req, res) => {
  try {
    const { name, category, amount, dueDate, theme } = req.body;
    const userId = req.userId;

    // find the category definition
    const categoryDef = await prisma.categoryDefinition.findFirst({
      where: {
        name: category,
        OR: [
          { creatorId: null }, // standard
          { creatorId: userId }, // user-defined
        ],
      },
    });

    if (!categoryDef) {
      return res.status(400).json({ message: "Unknown category" });
    }

    const bill = await prisma.recurringBill.create({
      data: {
        name,
        amount,
        dueDate,
        theme,
        categoryDefinitionId: categoryDef.id,
        userId: req.userId,
        lastPaid: null,
      },
    });

    return res.status(201).json(bill);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* PUT /api/bills/:id */
export const editBill = async (req, res) => {
  const { id } = req.params; // bill / recurringId
  const userId = req.userId;
  const { name, amount, dueDate, category } = req.body;

  console.log("Editing bill:", { id, userId, name, amount, dueDate, category });
  try {
    const bill = await prisma.recurringBill.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    let categoryDefinitionId;
    if (category !== undefined) {
      const cat = await prisma.categoryDefinition.findFirst({
        where: {
          name: category,
          OR: [{ creatorId: null }, { creatorId: userId }],
        },
        select: { id: true },
      });
      if (!cat) return res.status(400).json({ message: "Unknown category" });
      categoryDefinitionId = cat.id;
    }

    const billData = {};
    if (name !== undefined) billData.name = name;
    if (amount !== undefined) billData.amount = amount;
    if (dueDate !== undefined) billData.dueDate = dueDate;
    if (categoryDefinitionId)
      billData.categoryDefinitionId = categoryDefinitionId;

    const txData = {};
    if (name !== undefined) txData.name = name;
    if (categoryDefinitionId !== undefined)
      txData.categoryDefinitionId = categoryDefinitionId;

    const [updatedBill, { count: rowsTouched }] = await prisma.$transaction([
      prisma.recurringBill.update({
        where: { id },
        data: billData,
        select: {
          id: true,
          name: true,
          amount: true,
          dueDate: true,
          lastPaid: true,
          theme: true,
          category: { select: { name: true } },
        },
      }),
      Object.keys(txData).length
        ? prisma.transaction.updateMany({
            where: { recurringId: id, userId },
            data: txData,
          })
        : Promise.resolve({ count: 0 }),
    ]);

    console.log(rowsTouched);
    return res.json({
      ...updatedBill,
      category: updatedBill.category?.name ?? null,
      propagated: rowsTouched, // debugging aid
    });
  } catch (err) {
    console.error("Error updating bill:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* DELETE /api/bills/:id */
export const deleteBill = async (req, res) => {
  try {
    await prisma.recurringBill.delete({
      where: { id: req.params.id, userId: req.userId },
    });

    return res.status(204).json({ message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

/* GET /api/bills/stats */
export const billStats = async (req, res) => {
  const bills = await prisma.recurringBill.findMany({
    where: { userId: req.userId },
  });
  const stats = {
    total: 0,
    paid: { count: 0, total: 0 },
    unpaid: { count: 0, total: 0 },
    dueSoon: { count: 0, total: 0 },
    due: { count: 0, total: 0 },
  };
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  bills.forEach((b) => {
    const amt = Math.abs(b.amount);
    stats.total += amt;
    const lastPaid = b.lastPaid ? new Date(b.lastPaid) : null;
    const dueDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      Number(b.dueDate)
    );
    const diff = (dueDate - now) / 86400000;

    if (lastPaid && lastPaid >= start) {
      stats.paid.count++;
      stats.paid.total += amt;
      return;
    }
    if (diff <= 0) {
      stats.due.count++;
      stats.due.total += amt;
      return;
    }
    if (diff <= 3) {
      stats.dueSoon.count++;
      stats.dueSoon.total += amt;
      return;
    }
    stats.unpaid.count++;
    stats.unpaid.total += amt;
  });

  res.json(stats);
};
