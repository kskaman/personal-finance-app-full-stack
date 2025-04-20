// controllers/budgetsController.js
import prisma from "../prisma.js";

/**
 * GET /budgets
 * Fetch all budgets for the authenticated user.
 */
export async function getAllBudgets(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const userData = await prisma.data.findUnique({
      where: { userId },
      include: { budgets: true },
    });
    if (!userData) {
      const error = new Error("User data not found");
      error.statusCode = 404;
      return next(error);
    }

    return res.json(userData.budgets);
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /budgets
 * Create a new budget category with a maximum limit.
 */
export async function createBudget(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  const { category, maximum, theme } = req.body;
  try {
    const userData = await prisma.data.findUnique({ where: { userId } });
    if (!userData) {
      const error = new Error("Data record not found");
      error.statusCode = 404;
      return next(error);
    }

    const newBudget = await prisma.budget.create({
      data: {
        dataId: userData.id,
        category,
        maximum: parseFloat(maximum),
        theme,
      },
    });

    return res.status(201).json(newBudget);
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /budgets/:id
 * Update an existing budget by ID.
 */
export async function updateBudget(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  const { id } = req.params;
  try {
    const updated = await prisma.budget.update({
      where: { id },
      data: req.body,
    });
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /budgets/:id
 * Remove a budget by ID.
 */
export async function deleteBudget(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  const { id } = req.params;
  try {
    await prisma.budget.delete({ where: { id } });
    return res.json({ message: "Budget deleted successfully" });
  } catch (error) {
    return next(error);
  }
}
