import prisma from "../prismaClient.js";

/* ---------- helpers ---------- */

const potSelect = {
  id: true,
  name: true,
  target: true,
  total: true,
  theme: true,
  updatedAt: true,
};

export const getPots = async (req, res) => {
  const pots = await prisma.pot.findMany({
    where: { userId: req.userId },
    orderBy: { name: "asc" },
    select: potSelect,
  });
  res.json(pots);
};

export const addPot = async (req, res) => {
  const { name, target, theme } = req.body;
  try {
    const pot = await prisma.pot.create({
      data: {
        name,
        target: parseFloat(target),
        theme,
        userId: req.userId,
      },
      select: potSelect,
    });
    res.status(201).json(pot);
  } catch (err) {
    if (err.code === "P2002") {
      // unique constraint
      return res.status(400).json({ message: "Pot name already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const editPot = async (req, res) => {
  try {
    const pot = await prisma.pot.update({
      where: { id: req.params.id, userId: req.userId },
      data: {
        name: req.body.name,
        target: parseFloat(req.body.target),
        theme: req.body.theme,
      },
      select: potSelect,
    });
    res.json(pot);
  } catch (err) {
    res.status(404).json({ message: "Pot not found" });
  }
};

export const deletePot = async (req, res) => {
  try {
    const pot = await prisma.pot.delete({
      where: { id: req.params.id, userId: req.userId },
    });
    // Return deleted total so frontend can credit balance if desired
    res.json({ removedTotal: pot.total });
  } catch (err) {
    res.status(404).json({ message: "Pot not found" });
  }
};

/* ---- add / withdraw money within a pot ---- */
export const addToPot = async (req, res) => {
  const { type, amount } = req.body; // type = "add" | "withdraw"
  const delta = type === "add" ? amount : -amount;

  try {
    const pot = await prisma.pot.update({
      where: { id: req.params.id, userId: req.userId },
      data: { total: { increment: delta } },
      select: potSelect,
    });
    if (pot.total < 0) {
      // rollback
      await prisma.pot.update({
        where: { id: pot.id },
        data: { total: { decrement: delta } },
      });
      return res.status(400).json({ message: "Insufficient funds in pot" });
    }
    res.json(pot);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: "Pot not found" });
  }
};

export const withdrawFromPot = async (req, res) => {
  const { type, amount } = req.body; // type = "add" | "withdraw"
  const delta = type === "add" ? amount : -amount;

  try {
    const pot = await prisma.pot.update({
      where: { id: req.params.id, userId: req.userId },
      data: { total: { increment: delta } },
      select: potSelect,
    });
    if (pot.total < 0) {
      // rollback
      await prisma.pot.update({
        where: { id: pot.id },
        data: { total: { decrement: delta } },
      });
      return res.status(400).json({ message: "Insufficient funds in pot" });
    }
    res.json(pot);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: "Pot not found" });
  }
};
