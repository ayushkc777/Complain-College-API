import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../app";
import { UserService } from "../services/user.service";
import { JWT_SECRET } from "../config";

const app = createApp();

function tokenFor(payload: Record<string, unknown>) {
  return jwt.sign(payload, JWT_SECRET);
}

describe("Auth routes integration", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("POST /api/auth/register returns 201 on valid payload", async () => {
    jest.spyOn(UserService.prototype, "createUser").mockResolvedValue({ _id: "1" } as any);
    const response = await request(app).post("/api/auth/register").send({
      email: "a@a.com",
      username: "alpha",
      password: "secret1",
      confirmPassword: "secret1",
    });
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  test("POST /api/auth/register returns 400 on invalid payload", async () => {
    const response = await request(app).post("/api/auth/register").send({});
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/auth/register returns service error status", async () => {
    jest
      .spyOn(UserService.prototype, "createUser")
      .mockRejectedValue({ statusCode: 403, message: "Email already in use" });
    const response = await request(app).post("/api/auth/register").send({
      email: "a@a.com",
      username: "alpha",
      password: "secret1",
      confirmPassword: "secret1",
    });
    expect(response.status).toBe(403);
  });

  test("POST /api/auth/login returns 200 on valid payload", async () => {
    jest.spyOn(UserService.prototype, "loginUser").mockResolvedValue({
      token: "t",
      user: { _id: "1", email: "a@a.com" },
    } as any);
    const response = await request(app).post("/api/auth/login").send({
      email: "a@a.com",
      password: "secret1",
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("POST /api/auth/login returns 400 on invalid payload", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "bad",
      password: "1",
    });
    expect(response.status).toBe(400);
  });

  test("POST /api/auth/login returns 401 when service rejects", async () => {
    jest
      .spyOn(UserService.prototype, "loginUser")
      .mockRejectedValue({ statusCode: 401, message: "Invalid credentials" });
    const response = await request(app).post("/api/auth/login").send({
      email: "a@a.com",
      password: "secret1",
    });
    expect(response.status).toBe(401);
  });

  test("PUT /api/auth/:id returns 401 without token", async () => {
    const response = await request(app).put("/api/auth/abc").send({});
    expect(response.status).toBe(401);
  });

  test("PUT /api/auth/:id returns 403 for non-owner non-admin", async () => {
    const token = tokenFor({ id: "user-1", role: "user" });
    const response = await request(app)
      .put("/api/auth/user-2")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(response.status).toBe(403);
  });

  test("PUT /api/auth/:id returns 200 for owner", async () => {
    jest.spyOn(UserService.prototype, "updateUser").mockResolvedValue({ _id: "user-1" } as any);
    const token = tokenFor({ id: "user-1", role: "user" });
    const response = await request(app)
      .put("/api/auth/user-1")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(response.status).toBe(200);
  });

  test("POST /api/auth/forgot-password returns 200", async () => {
    jest
      .spyOn(UserService.prototype, "forgotPassword")
      .mockResolvedValue({ message: "sent", token: "token" } as any);
    const response = await request(app).post("/api/auth/forgot-password").send({
      email: "a@a.com",
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("POST /api/auth/forgot-password returns 400 on invalid payload", async () => {
    const response = await request(app).post("/api/auth/forgot-password").send({
      email: "x",
    });
    expect(response.status).toBe(400);
  });

  test("POST /api/auth/reset-password returns 200", async () => {
    jest
      .spyOn(UserService.prototype, "resetPassword")
      .mockResolvedValue({ message: "Password reset successful" });
    const response = await request(app).post("/api/auth/reset-password").send({
      token: "token-12345678",
      password: "secret1",
      confirmPassword: "secret1",
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("POST /api/auth/reset-password returns 400 on invalid payload", async () => {
    const response = await request(app).post("/api/auth/reset-password").send({
      token: "token-12345678",
      password: "secret1",
      confirmPassword: "secret2",
    });
    expect(response.status).toBe(400);
  });
});
