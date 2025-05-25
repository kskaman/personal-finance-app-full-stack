import prisma from "../prismaClient.js";

/* selection helper */
const budgetsSelect = {
  id: true,
  category: {
    select: { name: true },
  },
  maximum: true,
  theme: true,
};

/* GET /api/budgets */
export const getBudgets = async (req, res) => {
  const userId = req.userId;

  try {
    const raw = await prisma.budget.findMany({
      where: { userId },
      orderBy: {
        category: {
          name: "asc",
        },
      },
      select: budgetsSelect,
    });

    const budgets = raw.map((b) => {
      const categoryName = b.category?.name;

      return {
        id: b.id,
        maximum: b.maximum,
        theme: b.theme,
        category: categoryName,
      };
    });
    return res.status(200).json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* POST /api/budgets/:id */
/* { categoryName, maximum, theme } */
export const addBudget = async (req, res) => {
  const { category, maximum, theme } = req.body;
  const userId = req.userId;

  if (!category?.trim() || !theme?.trim() || isNaN(Number(maximum))) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  try {
    // Find the definition
    const catDef = await prisma.categoryDefinition.findFirst({
      where: {
        name: category,
        OR: [{ creatorId: null }, { creatorId: userId }],
      },
    });
    if (!catDef) return res.status(404).json({ message: "Category not found" });

    // Create the budget
    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryDefinitionId: catDef.id,
        maximum: parseFloat(maximum),
        theme,
      },
      select: budgetsSelect,
    });

    return res.status(201).json({
      id: budget.id,
      theme: budget.theme,
      maximum: budget.maximum,
      category: catDef.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* PATCH /api/budgets/:id */
export const updateBudget = async (req, res) => {
  const budgetId = req.params.id;

  const { maximum, theme } = req.body;

  if (!theme?.trim() || isNaN(Number(maximum))) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  try {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId: req.userId },
    });

    if (budget === null)
      return res.status(404).json({ message: "Budget not found" });

    const updatedBudget = await prisma.budget.update({
      where: { id: budget.id },
      data: { maximum: parseFloat(maximum), theme },
    });

    res.status(200).json(updatedBudget);
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ message: "Budget not found" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* DELETE /api.budgets/:id */
export const deleteBudget = async (req, res) => {
  const budgetId = req.params.id;

  try {
    const { count } = await prisma.budget.deleteMany({
      where: { id: budgetId, userId: req.userId },
    });
    if (count === 0)
      return res.status(404).json({ message: "Budget not found" });

    return res.status(204).end();
  } catch (err) {
    if (err.message === "NOT_FOUND" || err.code === "P2025")
      return res.status(404).json({ message: "Budget not found" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBudgetStats = async (req, res) => {
  const userId = req.userId;
  const { month } = req.body;

  if (typeof month !== "string" || !/^\d{4}-\d{2}$/.test(month)) {
    return res
      .status(400)
      .json({ message: "Invalid or missing month (yyyy-mm)" });
  }

  try {
    // Get total maximum sum
    const aggregate = await prisma.budget.aggregate({
      where: { userId },
      _sum: { maximum: true },
    });

    // Fetch all budgets for the user
    const allBudgets = await prisma.budget.findMany({
      where: { userId },
      select: {
        id: true,
        maximum: true,
        category: { select: { name: true } },
        theme: true,
      },
      orderBy: { category: { name: "asc" } },
    });

    const allCategories = allBudgets.map((b) => b.category.name);

    const start = new Date(`${month}-01T00:00:00Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lt: end },
        category: { name: { in: allCategories } },
      },
      include: { category: true },
    });

    const spentByCategory = {};

    for (const tx of transactions) {
      const name = tx.category.name;
      const amt = tx.amount < 0 ? Math.abs(tx.amount) : 0;
      if (!spentByCategory[name]) spentByCategory[name] = 0;
      spentByCategory[name] += amt;
    }

    const budgets = allBudgets.map((b) => ({
      id: b.id,
      category: b.category.name,
      theme: b.theme,
      maximum: b.maximum,
      spent: spentByCategory[b.category.name] || 0,
    }));

    res.status(200).json({
      totalMaximum: aggregate._sum.maximum ?? 0,
      budgets,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
