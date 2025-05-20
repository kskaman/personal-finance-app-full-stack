import prisma from "../prismaClient.js";
import { CategoryType } from "@prisma/client";

/** Flatten helper */
function flatten(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
  };
}

/** GET /api/categories */
export const getAllCategories = async (req, res) => {
  try {
    const rows = await prisma.categoryDefinition.findMany({
      where: { OR: [{ creatorId: null }, { creatorId: req.userId }] },
      select: {
        id: true,
        name: true,
        type: true,
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json(rows.map(flatten));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/** POST /api/categories */
export const createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    // Prevent global duplicate
    if (await prisma.categoryDefinition.findUnique({ where: { name } })) {
      return res.status(409).json({ message: "Category already exists" });
    }
    // Create master definition
    const def = await prisma.categoryDefinition.create({
      data: { name, type: CategoryType.custom, creatorId: req.userId },
    });

    res.status(201).json(flatten(def));
  } catch (err) {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

/** PUT /api/categories/:id */
export const renameCategory = async (req, res) => {
  const { name } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const link = await prisma.categoryDefinition.findFirst({
      where: {
        id: req.params.id,
        creatorId: req.userId,
        type: CategoryType.custom,
      },
    });
    if (!link) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Update definition
    const updated = await prisma.categoryDefinition.update({
      where: { id: link.id },
      data: { name },
    });

    res.json(flatten(updated));
  } catch (err) {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

/** DELETE /api/categories/:id */
export const deleteCategory = async (req, res) => {
  try {
    const link = await prisma.categoryDefinition.findFirst({
      where: {
        id: req.params.id,
        creatorId: req.userId,
        type: CategoryType.custom,
      },
    });
    if (!link) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Reassign to "General"
    const generalLink = await prisma.categoryDefinition.findFirst({
      where: {
        name: "General",
        type: CategoryType.standard,
      },
    });
    if (!generalLink) {
      return res.status(500).json({ message: "General category not found" });
    }

    // Update transactions
    await prisma.transaction.updateMany({
      where: { userId: req.userId, categoryDefinitionId: link.id },
      data: { categoryDefinitionId: generalLink.id },
    });

    // Delete budgets
    await prisma.budget.deleteMany({
      where: { categoryDefinitionId: link.id },
    });

    // Update recurring bills
    await prisma.recurringBill.updateMany({
      where: { userId: req.userId, categoryDefinitionId: link.id },
      data: { categoryDefinitionId: generalLink.id },
    });

    // Delete the linked category definition
    await prisma.categoryDefinition.delete({
      where: { id: link.id },
    });

    return res.status(204).json({ message: "Category unlinked successfully." });
  } catch (err) {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};
