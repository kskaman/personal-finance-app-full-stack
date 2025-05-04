import { Font, Currency } from "@prisma/client";
import prisma from "../prismaClient.js";

/**
 * PUT /api/settings/font - update selected font in settings
 */
export const updateFont = async (req, res) => {
  const { font } = req.body;

  if (!Object.values(Font).includes(font)) {
    return res.status(400).json({ message: "Invalid font selection." });
  }

  try {
    const updated = await prisma.settings.update({
      where: { userId: req.userId },
      data: { font },
    });

    return res.json({
      message: "Font updated successfully.",
      font: updated.font,
    });
  } catch (err) {
    console.error("Update font error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * PUT /api/settings/currency - update selected currency in settings
 */
export const updateCurrency = async (req, res) => {
  const { currency } = req.body;

  if (!Object.values(Currency).includes(currency)) {
    return res.status(400).json({ message: "Invalid currency selection." });
  }

  try {
    const updated = await prisma.settings.update({
      where: { userId: req.userId },
      data: { currency },
    });

    return res.json({
      message: "Currency updated successfully.",
      currency: updated.currency,
    });
  } catch (err) {
    console.error("Update currency error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * PUT /api/settings/displayedPots - update display status of pots page
 */
export const updateDisplayedPots = async (req, res) => {
  const userId = req.userId;
  const { pots } = req.body;

  try {
    const updatedSettings = await prisma.settings.update({
      where: { userId },
      data: {
        pots,
      },
    });

    return res.json(updatedSettings);
  } catch (err) {
    console.error("Error updating displayed pots:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/settings/displayedBudgets - update display status of budgets page
 */
export const updateDisplayedBudgets = async (req, res) => {
  const userId = req.userId;
  const { budgets } = req.body;

  try {
    const updatedSettings = await prisma.settings.update({
      where: { userId },
      data: {
        budgets,
      },
    });

    return res.json(updatedSettings);
  } catch (err) {
    console.error("Error updating displayed pots:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/settings/displayedBills - update display status of recurring bills page
 */
export const updateDisplayedBills = async (req, res) => {
  const userId = req.userId;
  const { bills } = req.body;

  try {
    const updatedSettings = await prisma.settings.update({
      where: { userId },
      data: {
        bills,
      },
    });

    return res.json(updatedSettings);
  } catch (err) {
    console.error("Error updating displayed pots:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
