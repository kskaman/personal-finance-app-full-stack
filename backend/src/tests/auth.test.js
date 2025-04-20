import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  test,
  expect,
  vi,
} from "vitest";
import request from "supertest";
import app from "../app.js";
import prisma from "../prisma.js";

/* ──────────────── mock email sender ──────────────── */
vi.mock("../utils/sendEmail.js", () => ({ sendEmail: vi.fn() }));
import { sendEmail } from "../utils/sendEmail.js";

/* ──────────────── helpers ──────────────── */
const userA = {
  name: "John Doe",
  email: "john@example.com",
  password: "Password123!",
};
const userB = {
  name: "Jane Doe",
  email: "jane@example.com",
  password: "Password123!",
};

async function tokenFromMock(callIndex = 0) {
  const html = sendEmail.mock.calls[callIndex][0].html;
  return /token=([a-z0-9]+)/i.exec(html)[1];
}

async function dbUser(email) {
  return prisma.user.findUnique({ where: { email } });
}

/* ──────────────── hooks ──────────────── */
beforeAll(() => prisma.$connect());

beforeEach(async () => {
  await prisma.$transaction([
    prisma.balance.deleteMany(),
    prisma.settings.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  vi.clearAllMocks();
});

afterAll(() => prisma.$disconnect());

/* ──────────────── tests ──────────────── */
describe("Auth routes", () => {
  /* 1 ─ signup happy‑path */
  test("Signup with valid details returns 201 and sends verification email", async () => {
    const res = await request(app).post("/api/auth/signup").send(userA);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe(
      "Signup successful. Please check your email to verify your account."
    );
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail.mock.calls[0][0]).toMatchObject({
      to: userA.email,
      subject: "Verify Your Email",
    });

    const token = await tokenFromMock();
    const inDb = await dbUser(userA.email);
    expect(inDb.verificationToken).toBe(token);
    expect(inDb.isVerified).toBe(false);
  });

  /* 2 ─ signup duplicate */
  test("Signup with existing email returns 400", async () => {
    await request(app).post("/api/auth/signup").send(userA);
    const res = await request(app).post("/api/auth/signup").send(userA);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Check your email for verification instructions."
    );
  });

  /* 3 ─ verify email success */
  test("Verify email with correct token activates account", async () => {
    await request(app).post("/api/auth/signup").send(userA);
    const token = await tokenFromMock();

    const res = await request(app)
      .post("/api/auth/verify-email")
      .send({ token });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe(
      "Email verified successfully. You can now log in."
    );

    const inDb = await dbUser(userA.email);
    expect(inDb.isVerified).toBe(true);
  });

  /* 4 ─ verify email invalid */
  test("Verify email with invalid token returns 400", async () => {
    const res = await request(app)
      .post("/api/auth/verify-email")
      .send({ token: "invalid-token" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid or expired verification link.");
  });

  /* 5 ─ login valid (verified) */
  test("Login with valid credentials and verified email returns 200 and token", async () => {
    await request(app).post("/api/auth/signup").send(userA);
    const token = await tokenFromMock();
    await request(app).post("/api/auth/verify-email").send({ token });

    const res = await request(app).post("/api/auth/login").send({
      email: userA.email,
      password: userA.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logged in successfully.");
    expect(res.body.token).toBeDefined();
  });

  /* 6 ─ login wrong password */
  test("Login with invalid credentials returns 400", async () => {
    await request(app).post("/api/auth/signup").send(userA);
    const token = await tokenFromMock();
    await request(app).post("/api/auth/verify-email").send({ token });

    const res = await request(app).post("/api/auth/login").send({
      email: userA.email,
      password: "WrongPassword123!",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid email or password.");
  });

  /* 7 ─ login unverified */
  test("Login with unverified email returns s403", async () => {
    await request(app).post("/api/auth/signup").send(userB);

    const res = await request(app).post("/api/auth/login").send({
      email: userB.email,
      password: userB.password,
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe(
      "Please verify your email before logging in."
    );
  });

  /* 8 ─ forgot‑password registered */
  test("Forgot-password with registered email returns 200", async () => {
    await request(app).post("/api/auth/signup").send(userA);
    const token = await tokenFromMock();
    await request(app).post("/api/auth/verify-email").send({ token });

    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: userA.email });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe(
      "If your email is registered, you will receive a password reset link shortly."
    );
    expect(sendEmail).toHaveBeenCalledTimes(2); // signup + reset
  });

  /* 9 ─ forgot‑password unregistered */
  test("Forgot-password with unregistered email still returns 200", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "notregistered@example.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe(
      "If your email is registered, you will receive a password reset link shortly."
    );

    expect(sendEmail).toHaveBeenCalledTimes(0);
  });

  /* 10 ─ reset‑password success */
  test("Reset password with valid token returns 200", async () => {
    // signup + verify
    await request(app).post("/api/auth/signup").send(userA);
    const verifyToken = await tokenFromMock();
    await request(app)
      .post("/api/auth/verify-email")
      .send({ token: verifyToken });

    // request reset
    await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: userA.email });
    const resetToken = await tokenFromMock(1);

    // reset
    const res = await request(app).post("/api/auth/reset-password").send({
      token: resetToken,
      newPassword: "NewPassword123!",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe(
      "Password has been reset successfully. You can now log in."
    );
  });

  /* 11 ─ reset‑password invalid token */
  test("Reset password with invalid token returns 400", async () => {
    const res = await request(app).post("/api/auth/reset-password").send({
      token: "invalid-reset-token",
      newPassword: "NewPassword123!",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid or expired reset link.");
  });
});
