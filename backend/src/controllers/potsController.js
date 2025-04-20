// controllers/potsController.js
import prisma from "../prisma.js";

/**
 * GET /pots
 * Fetch all pots (e.g., saving pots) for the authenticated user.
 */
export async function getAllPots(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const userData = await prisma.data.findUnique({
      where: { userId },
      include: { pots: true },
    });
    if (!userData) {
      const error = new Error("User data not found");
      error.statusCode = 404;
      return next(error);
    }

    return res.json(userData.pots);
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /pots
 * Create a new pot with a target and initial total.
 */
export async function createPot(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  const { name, target, total, theme } = req.body;
  try {
    const userData = await prisma.data.findUnique({ where: { userId } });
    if (!userData) {
      const error = new Error("Data record not found");
      error.statusCode = 404;
      return next(error);
    }

    const newPot = await prisma.pot.create({
      data: {
        dataId: userData.id,
        name,
        target: parseFloat(target),
        total: parseFloat(total),
        theme,
      },
    });

    return res.status(201).json(newPot);
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /pots/:id
 * Update a pot. If deposit/withdraw is provided, adjust the total.
 */
export async function updatePot(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  const { id } = req.params;
  const { deposit, withdraw } = req.body;

  try {
    const pot = await prisma.pot.findUnique({ where: { id } });
    if (!pot) {
      const error = new Error("Pot not found");
      error.statusCode = 404;
      return next(error);
    }

    // Calculate new total
    let newTotal = pot.total;
    if (deposit) {
      newTotal += parseFloat(deposit);
    }
    if (withdraw) {
      newTotal -= parseFloat(withdraw);
      if (newTotal < 0) {
        newTotal = 0; // or handle negative as an error
      }
    }

    const updatedPot = await prisma.pot.update({
      where: { id },
      data: {
        ...req.body,
        total: newTotal,
      },
    });

    return res.json(updatedPot);
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /pots/:id
 * Remove a pot by ID.
 */
export async function deletePot(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  const { id } = req.params;
  try {
    await prisma.pot.delete({ where: { id } });
    return res.json({ message: "Pot deleted successfully" });
  } catch (error) {
    return next(error);
  }
}
