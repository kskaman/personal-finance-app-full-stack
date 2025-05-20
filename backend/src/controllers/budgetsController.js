import prisma from "../prismaClient";

/* selection helper */
const budgetsSelect = {
  id: true,
  category: {
    select: {
      categoryDefinition: {
        select: { name: true },
      },
    },
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
          categoryDefinition: {
            name: "asc",
          },
        },
      },
      select: budgetsSelect,
    });

    const budgets = raw.map((b) => {
      const categoryName = b.category?.categoryDefinition?.name;

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
    // fnd category definition
    const userCat = await prisma.categoryDefinition.findFirst({
      where: {
        userId,
        categoryDefinition: {
          name: category,
        },
      },
    });

    if (!userCat) {
      return res.status(404).json({ message: "Category not found" });
    }

    const [budget] = await prisma.$transaction([
      prisma.budget.create({
        data: {
          userId,
          userCategoryId: userCat.id,
          maximum: parseFloat(maximum),
          theme,
        },
      }),
      prisma.userCategory.update({
        where: { id: userCat.id },
        data: { usedInBudgets: true },
      }),
    ]);

    return res.status(201).json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* PATCH /api/budgets/:id */
export const updateBudget = async (req, res) => {
  const budgetId = req.params.id;

  const { maximum, theme } = req.body;
  const userId = req.userId;

  if (!theme?.trim() || isNaN(Number(maximum))) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  try {
    const budget = await prisma.budget.update({
      where: { id: budgetId, userId },
      data: {
        maximum: parseFloat(maximum),
        theme,
      },
    });

    res.json(budget);
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ message: "Pot not found" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* DELETE /api.budgets/:id */
export const deleteBudget = async (req, res) => {
  const budgetId = req.params.id;

  try {
    await prisma.budget.delete({ where: { id: budgetId } });
    res.status(204).end();
  } catch (err) {
    if (err.message === "NOT_FOUND" || err.code === "P2025")
      return res.status(404).json({ message: "Pot not found" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBudgetStats = async (req, res) => {
  const userId = req.userId;

  try {
    // Get total maximum sum
    const aggregate = await prisma.budget.aggregate({
      where: { userId },
      _sum: {
        maximum: true,
      },
    });

    // Get top 4 budgets sorted alphabetically by category name
    const topBudgetsRaw = await prisma.budget.findMany({
      where: { userId },
      select: {
        maximum: true,
        category: {
          select: {
            categoryDefinition: {
              select: { name: true },
            },
          },
        },
        theme: true,
      },
      orderBy: {
        category: {
          categoryDefinition: {
            name: "asc",
          },
        },
      },
      take: 4,
    });

    const topBudgets = topBudgetsRaw.map((b) => ({
      maximum: b.maximum,
      category: b.category.categoryDefinition.name,
      theme: b.theme,
    }));

    res.status(201).json({
      totalMaximum: aggregate._sum.maximum,
      topBudgets,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
