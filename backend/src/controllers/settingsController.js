import { Font, Currency } from "@prisma/client";
import prisma from "../prismaClient.js";

/**
 * PUT /api/settings
 * Accepts only one of: font, currency, pots, budgets, bills
 */
export const updateSettings = async (req, res) => {
  const userId = req.userId;
  const { font, currency, pots, budgets, bills } = req.body;

  const data = {};

  try {
    if (font !== undefined) {
      if (!Object.values(Font).includes(font)) {
        return res.status(400).json({ message: "Invalid font selection." });
      }
      data.font = font;
    } else if (currency !== undefined) {
      if (!Object.values(Currency).includes(currency)) {
        return res.status(400).json({ message: "Invalid currency selection." });
      }
      data.currency = currency;
    } else if (pots !== undefined) {
      if (typeof pots !== "boolean") {
        return res.status(400).json({ message: "Invalid value given." });
      }
      data.pots = pots;
    } else if (budgets !== undefined) {
      if (typeof budgets !== "boolean") {
        return res.status(400).json({ message: "Invalid value given." });
      }
      data.budgets = budgets;
    } else if (bills !== undefined) {
      if (typeof bills !== "boolean") {
        return res.status(400).json({ message: "Invalid value given." });
      }
      data.bills = bills;
    } else {
      return res.status(400).json({ message: "No valid setting provided." });
    }

    const updated = await prisma.settings.update({
      where: { userId },
      data,
    });

    return res.json({
      message: "Setting updated successfully.",
      settings: updated,
    });
  } catch (err) {
    console.error("Update settings error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
