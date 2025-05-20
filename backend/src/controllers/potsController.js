import prisma from "../prismaClient.js";

// helpers

// always return the public-facing fields for a pot
const potSelect = {
  id: true,
  name: true,
  target: true,
  total: true,
  theme: true,
};

//  routes

/* GET /api/pots */
export const getPots = async (req, res) => {
  try {
    const pots = await prisma.pot.findMany({
      where: { userId: req.userId },
      orderBy: { name: "asc" },
      select: potSelect,
    });
    return res.json(pots);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

/* POST /api/pots   body: { name, target, theme } */
export const addPot = async (req, res) => {
  const { name, target, theme } = req.body;
  const userId = req.userId;

  if (!name?.trim() || isNaN(Number(target)) || !theme?.trim())
    return res.status(400).json({ message: "Invalid payload" });

  try {
    const pot = await prisma.pot.create({
      data: {
        userId,
        name: name.trim(),
        target: Number(target),
        theme: theme.trim(),
        total: 0,
      },
      select: potSelect,
    });

    res.status(201).json(pot);
  } catch (error) {
    if (error.code === "P2002")
      return res.status(400).json({ message: "Pot name already exists" });
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* PUT /api/pots/:id   body: { name?, target?, theme? } */
export const editPot = async (req, res) => {
  const userId = req.userId;

  const potId = req.params.id;
  const { name, target, theme } = req.body;

  const bad =
    (name !== undefined && !name.trim()) ||
    (target !== undefined && isNaN(Number(target))) ||
    (theme !== undefined && !theme.trim());

  if (bad) return res.status(400).json({ message: "Invalid payload" });

  try {
    const pot = await prisma.pot.update({
      where: { id: potId, userId },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(target !== undefined ? { target: Number(target) } : {}),
        ...(theme !== undefined ? { theme: theme.trim() } : {}),
      },
      select: potSelect,
    });

    res.status(200).json(pot);
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Pot not found" });
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* DELETE /api/pots/:id */
export const deletePot = async (req, res) => {
  const userId = req.userId;
  const potId = req.params.id;

  try {
    await prisma.pot.delete({
      where: { id: potId, userId },
    });

    res.status(204).end();
  } catch (error) {
    if (error.message === "NOT_FOUND" || error.code === "P2025")
      return res.status(404).json({ message: "Pot not found" });
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* POST /api/pots/:id/transactions   body: { type, amount } */
export const potTransaction = async (req, res) => {
  const { type, amount } = req.body;
  if (!["add", "withdraw"].includes(type) || isNaN(Number(amount)))
    return res.status(400).json({ message: "Invalid payload" });

  const delta = type === "add" ? Number(amount) : -Number(amount);

  try {
    const pot = await prisma.$transaction(async (tx) => {
      const updated = await tx.pot.update({
        where: { id: req.params.id, userId: req.userId },
        data: { total: { increment: delta } },
        select: potSelect,
      });

      if (updated.total < 0) throw new Error("INSUFFICIENT_FUNDS");
      return updated;
    });

    res.json(pot);
  } catch (e) {
    if (e.message === "INSUFFICIENT_FUNDS")
      return res.status(400).json({ message: "Insufficient funds in pot" });
    if (e.code === "P2025")
      return res.status(404).json({ message: "Pot not found" });
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPotStats = async (req, res) => {
  const userId = req.userId;

  try {
    // Get total saved (sum of total from all pots)
    const aggregate = await prisma.pot.aggregate({
      where: { userId },
      _sum: {
        total: true,
      },
    });

    // Get top 4 pots sorted by name (alphabetically)
    const topPots = await prisma.pot.findMany({
      where: { userId },
      select: {
        name: true,
        total: true,
        theme: true,
      },
      orderBy: {
        name: "asc",
      },
      take: 4,
    });

    res.json({
      totalSaved: aggregate._sum.total,
      topPots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
