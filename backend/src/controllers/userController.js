import prisma from "../prismaClient.js";
import redis from "../redisClient.js";

export const getUserData = async (req, res) => {
  try {
    const sid = req.cookies.sid;

    if (!sid) {
      return res.status(401).json({ message: "No session ID provided." });
    }

    const userId = await redis.get(`SESSION:${sid}`);
    if (!userId) {
      return res.status(401).json({ message: "Session expired or invalid " });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
        balance: true,
        transactions: true,
        budgets: true,
        pots: true,
        recurringBills: true,
        categories: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      password,
      verificationToken,
      resetToken,
      verificationTokenExpiry,
      resetTokenExpiry,
      ...safeUser
    } = user;

    return res.json(safeUser);
  } catch (err) {
    console.log("Error in getUSerData:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};
