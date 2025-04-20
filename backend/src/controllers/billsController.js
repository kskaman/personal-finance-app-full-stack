// controllers/billsController.js
import prisma from "../prisma.js";

/**
 * GET /bills
 * Fetch all recurring bills for the authenticated user.
 */
export async function getAllBills(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const userData = await prisma.data.findUnique({
      where: { userId },
      include: { bills: true },
    });
    if (!userData) {
      const error = new Error("User data not found");
      error.statusCode = 404;
      return next(error);
    }

    return res.json(userData.bills);
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /bills
 * Create a new recurring bill.
 */
export async function createBill(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  const { name, category, amount, theme, lastPaid, dueDate } = req.body;
  try {
    const userData = await prisma.data.findUnique({ where: { userId } });
    if (!userData) {
      const error = new Error("Data record not found");
      error.statusCode = 404;
      return next(error);
    }

    const newBill = await prisma.recurringBill.create({
      data: {
        dataId: userData.id,
        name,
        category,
        amount: parseFloat(amount),
        theme,
        recurring: true,
        lastPaid: new Date(lastPaid),
        dueDate: String(dueDate),
      },
    });

    return res.status(201).json(newBill);
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /bills/:id
 * Update an existing recurring bill by ID.
 */
export async function updateBill(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  const { id } = req.params;
  try {
    const updated = await prisma.recurringBill.update({
      where: { id },
      data: req.body,
    });
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /bills/:id
 * Remove a recurring bill by ID.
 */
export async function deleteBill(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  const { id } = req.params;
  try {
    await prisma.recurringBill.delete({ where: { id } });
    return res.json({ message: "Bill deleted successfully" });
  } catch (error) {
    return next(error);
  }
}
