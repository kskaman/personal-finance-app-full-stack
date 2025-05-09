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

/** PATCH /api/users/me/name */
export const updateName = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }
  try {
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { name },
      select: { id: true, name: true, email: true, isVerified: true },
    });
    res.json(updated);
  } catch (err) {
    console.error("updateName error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** PATCH /api/users/me/password */
export const changePassword = async (req, res) => {
  const { newPassword } = req.body;

  try {
    // Fetch the user
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { password: true },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Hash new password & update
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashed },
    });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("changePassword error:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};
