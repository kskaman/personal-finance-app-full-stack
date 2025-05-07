import prisma from "../prismaClient.js";
import { CategoryType } from "@prisma/client";

/** Flatten helper */
function flatten(row) {
  return {
    id: row.id,
    name: row.categoryDefinition.name,
    type: row.categoryDefinition.type,
    usedInBudgets: row.usedInBudgets,
  };
}

/** GET /api/categories */
export const getAllCategories = async (req, res) => {
  try {
    const rows = await prisma.userCategory.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        usedInBudgets: true,
        categoryDefinition: { select: { name: true, type: true } },
      },
      orderBy: { categoryDefinition: { name: "asc" } },
    });

    res.json(rows.map(flatten));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/categories/:id */
export const getCategory = async (req, res) => {
  try {
    // findFirst lets us filter by both id & userId
    const link = await prisma.userCategory.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { categoryDefinition: { select: { name: true, type: true } } },
    });
    if (!link) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(flatten(link));
  } catch (err) {
    console.error("getCategory error:", err);
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
    // Link to user
    const link = await prisma.userCategory.create({
      data: { userId: req.userId, categoryDefinitionId: def.id },
      select: {
        id: true,
        usedInBudgets: true,
        categoryDefinition: { select: { name: true, type: true } },
      },
    });
    res.status(201).json(flatten(link));
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
    const link = await prisma.userCategory.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { categoryDefinition: true },
    });
    if (!link) {
      return res.status(404).json({ message: "Category not found" });
    }
    if (link.categoryDefinition.type !== CategoryType.custom) {
      return res
        .status(403)
        .json({ message: "Cannot rename standard category" });
    }
    // Update definition
    await prisma.categoryDefinition.update({
      where: { id: link.categoryDefinitionId },
      data: { name },
    });
    // Re-fetch updated link
    const updated = await prisma.userCategory.findUnique({
      where: { id: link.id },
      select: {
        id: true,
        usedInBudgets: true,
        categoryDefinition: { select: { name: true, type: true } },
      },
    });
    res.json(flatten(updated));
  } catch (err) {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

/** PATCH /api/categories/:id/flag */
export const toggleUsedInBudgets = async (req, res) => {
  try {
    const link = await prisma.userCategory.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!link) {
      return res.status(404).json({ message: "Category not found" });
    }
    const updated = await prisma.userCategory.update({
      where: { id: link.id },
      data: { usedInBudgets: !link.usedInBudgets },
      select: {
        id: true,
        usedInBudgets: true,
        categoryDefinition: { select: { name: true, type: true } },
      },
    });
    res.json(flatten(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/** DELETE /api/categories/:id */
export const deleteCategory = async (req, res) => {
  try {
    const link = await prisma.userCategory.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { categoryDefinition: true },
    });
    if (!link) {
      return res.status(404).json({ message: "Category not found" });
    }
    if (link.categoryDefinition.type !== CategoryType.custom) {
      return res
        .status(403)
        .json({ message: "Cannot delete standard category" });
    }
    // Reassign to "General"
    const generalLink = await prisma.userCategory.findFirst({
      where: {
        userId: req.userId,
        categoryDefinition: { name: "General" },
      },
    });
    if (!generalLink) {
      return res.status(500).json({ message: "General category not found" });
    }
    await prisma.$transaction([
      prisma.transaction.updateMany({
        where: { userId: req.userId, userCategoryId: link.id },
        data: { userCategoryId: generalLink.id },
      }),
      prisma.budget.deleteMany({ where: { userCategoryId: link.id } }),
      prisma.recurringBill.updateMany({
        where: { userId: req.userId, userCategoryId: link.id },
        data: { userCategoryId: generalLink.id },
      }),
      prisma.userCategory.delete({ where: { id: link.id } }),
      prisma.categoryDefinition.delete({
        where: { id: link.categoryDefinitionId },
      }),
    ]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};
