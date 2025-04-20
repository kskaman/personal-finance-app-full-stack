import { describe, test, expect, vi } from "vitest";
import request from "supertest";
import app from "../app.js";
import { sendEmail } from "../utils/sendEmail.js"; // Mocked email sending utility

// Mocking the sendEmail function to prevent actual email sending
vi.mock("../utils/sendEmail.js", () => ({
  sendEmail: vi.fn(),
}));

describe("Auth Routes", () => {
  // Test for signup route
  test("Signup with valid details should return 201 and send a verification email", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      name: "John Doe",
      email: "john@example.com",
      password: "Password123!",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe(
      "Signup successful. Please check your email to verify your account."
    );

    // Check if the sendEmail function was called
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "john@example.com",
        subject: "Verify Your Email",
      })
    );
  });

  test("Signup with existing email should return 400", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      name: "Jane Doe",
      email: "john@example.com", // Same email as the previous user
      password: "Password123!",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Check your email for verification instructions."
    );
  });

  // Test for email verification route
  test("Verify email with correct token should activate account", async () => {
    const verificationToken = "valid-token";
    const response = await request(app).post("/api/auth/verify-email").send({
      token: verificationToken,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "Email verified successfully. You can now log in."
    );
  });

  test("Verify email with expired or invalid token should return 400", async () => {
    const invalidToken = "invalid-token"; // Invalid token for test case
    const response = await request(app).post("/api/auth/verify-email").send({
      token: invalidToken,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid or expired verification link.");
  });

  // Test for login route
  test("Login with valid credentials and verified email should return 200 and token", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "john@example.com",
      password: "Password123!",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Logged in successfully.");
    expect(response.body.token).toBeDefined(); // Expect a token
  });

  test("Login with invalid credentials should return 400", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "john@example.com",
      password: "WrongPassword123!",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid email or password.");
  });

  test("Login with unverified email should return 403", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "unverified@example.com",
      password: "Password123!",
    });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe(
      "Please verify your email before logging in."
    );
  });

  // Test for forgot password route
  test("Forgot password with registered email should return success", async () => {
    const response = await request(app).post("/api/auth/forgot-password").send({
      email: "john@example.com",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "If your email is registered, you will receive a password reset link shortly."
    );
  });

  test("Forgot password with unregistered email should return success", async () => {
    const response = await request(app).post("/api/auth/forgot-password").send({
      email: "notregistered@example.com",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "If your email is registered, you will receive a password reset link shortly."
    );
  });

  // Test for reset password route
  test("Reset password with valid token should return success", async () => {
    const validToken = "valid-reset-token"; // Replace with actual token in a real test
    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: validToken, newPassword: "NewPassword123!" });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "Password has been reset successfully. You can now log in."
    );
  });

  test("Reset password with invalid or expired token should return 400", async () => {
    const invalidToken = "invalid-reset-token"; // Invalid token for testing
    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: invalidToken, newPassword: "NewPassword123!" });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid or expired reset link.");
  });
});
