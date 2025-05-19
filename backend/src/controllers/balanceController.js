import prisma from "../prismaClient.js";

/* selector */
const balanceSelect = {
  current: true,
  income: true,
  expenses: true,
};

/* GET /api/balance */
export const getBalance = async (req, res) => {
  try {
    const balance = await prisma.balance.findUnique({
      where: { userId: req.userId },
      select: balanceSelect,
    });
    return res.json(balance);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* PATCH /api/balance
   body: { deltaCurrent, deltaIncome, deltaExpenses }  (all numbers, any may be 0)
*/
export const updateBalance = async (req, res) => {
  // Accept strings or numbers and coerce to Number
  const current = Number(req.body.current);
  const income = Number(req.body.income);
  const expenses = Number(req.body.expenses);

  // Validate: must not be NaN (allows 0)
  if ([current, income, expenses].some((v) => Number.isNaN(v))) {
    return res
      .status(400)
      .json({ message: "Invalid data - numbers required." });
  }

  try {
    const updated = await prisma.balance.update({
      where: { userId: req.userId },
      data: { current, income, expenses },
      select: balanceSelect,
    });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
