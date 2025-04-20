// controllers/transactionsController.js
import prisma from "../prisma.js";

/**
 * GET /transactions
 * Fetch all transactions for the authenticated user.
 */
export async function getAllTransactions(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const userData = await prisma.data.findUnique({
      where: { userId },
      include: { transactions: true },
    });

    if (!userData) {
      const error = new Error("User data not found");
      error.statusCode = 404;
      return next(error);
    }

    return res.json(userData.transactions);
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /transactions
 * Create a new transaction (income/expense).
 */
export async function createTransaction(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  const { name, category, date, theme, amount, recurring } = req.body;

  try {
    const userData = await prisma.data.findUnique({ where: { userId } });
    if (!userData) {
      const error = new Error("Data record not found");
      error.statusCode = 404;
      return next(error);
    }

    const newTx = await prisma.transaction.create({
      data: {
        dataId: userData.id,
        name,
        category,
        date: new Date(date),
        theme,
        amount: parseFloat(amount),
        recurring: !!recurring,
      },
    });

    return res.status(201).json(newTx);
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /transactions/:id
 * Update an existing transaction by ID.
 */
export async function updateTransaction(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  const { id } = req.params;
  try {
    const updatedTx = await prisma.transaction.update({
      where: { id },
      data: req.body,
    });
    return res.json(updatedTx);
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /transactions/:id
 * Remove a transaction by ID.
 */
export async function deleteTransaction(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  const { id } = req.params;
  try {
    await prisma.transaction.delete({ where: { id } });
    return res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    return next(error);
  }
}
