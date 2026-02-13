import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../app";
import { UserService } from "../services/user.service";
import { JWT_SECRET } from "../config";

const app = createApp();

function adminToken() {
  return jwt.sign({ id: "admin-1", role: "admin" }, JWT_SECRET);
}

function userToken() {
  return jwt.sign({ id: "user-1", role: "user" }, JWT_SECRET);
}

describe("Admin user routes integration", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GET /api/admin/users returns 401 without token", async () => {
    const response = await request(app).get("/api/admin/users");
    expect(response.status).toBe(401);
  });

  test("GET /api/admin/users returns 403 for non-admin token", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${userToken()}`);
    expect(response.status).toBe(403);
  });

  test("GET /api/admin/users returns paginated users", async () => {
    jest.spyOn(UserService.prototype, "getAllUsers").mockResolvedValue({
      users: [{ _id: "u1", email: "a@a.com" }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    } as any);
    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(response.status).toBe(200);
    expect(response.body.pagination.page).toBe(1);
  });

  test("GET /api/admin/users forwards page and limit", async () => {
    const spy = jest.spyOn(UserService.prototype, "getAllUsers").mockResolvedValue({
      users: [],
      pagination: { page: 2, limit: 5, total: 0, totalPages: 1 },
    } as any);
    const response = await request(app)
      .get("/api/admin/users?page=2&limit=5")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(response.status).toBe(200);
    expect(spy).toHaveBeenCalledWith(2, 5);
  });

  test("GET /api/admin/users returns 400 for invalid query", async () => {
    const response = await request(app)
      .get("/api/admin/users?page=0&limit=5")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(response.status).toBe(400);
  });

  test("GET /api/admin/users/:id returns user", async () => {
    jest.spyOn(UserService.prototype, "getUserById").mockResolvedValue({ _id: "u1" } as any);
    const response = await request(app)
      .get("/api/admin/users/u1")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(response.status).toBe(200);
  });

  test("GET /api/admin/users/:id returns 404 when missing", async () => {
    jest
      .spyOn(UserService.prototype, "getUserById")
      .mockRejectedValue({ statusCode: 404, message: "User not found" });
    const response = await request(app)
      .get("/api/admin/users/u1")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(response.status).toBe(404);
  });

  test("POST /api/admin/users returns 201", async () => {
    jest.spyOn(UserService.prototype, "createUserByAdmin").mockResolvedValue({ _id: "u1" } as any);
    const response = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken()}`)
      .field("email", "a@a.com")
      .field("username", "alpha")
      .field("password", "secret1")
      .field("confirmPassword", "secret1")
      .field("role", "user");
    expect(response.status).toBe(201);
  });

  test("POST /api/admin/users returns 400 on bad payload", async () => {
    const response = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken()}`)
      .field("email", "bad");
    expect(response.status).toBe(400);
  });

  test("PUT /api/admin/users/:id returns 200", async () => {
    jest.spyOn(UserService.prototype, "updateUser").mockResolvedValue({ _id: "u1" } as any);
    const response = await request(app)
      .put("/api/admin/users/u1")
      .set("Authorization", `Bearer ${adminToken()}`)
      .field("firstName", "Updated");
    expect(response.status).toBe(200);
  });

  test("PUT /api/admin/users/:id returns 400 on invalid payload", async () => {
    const response = await request(app)
      .put("/api/admin/users/u1")
      .set("Authorization", `Bearer ${adminToken()}`)
      .field("email", "bad");
    expect(response.status).toBe(400);
  });

  test("DELETE /api/admin/users/:id returns 200", async () => {
    jest.spyOn(UserService.prototype, "deleteUser").mockResolvedValue(true);
    const response = await request(app)
      .delete("/api/admin/users/u1")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(response.status).toBe(200);
  });

  test("DELETE /api/admin/users/:id returns 404 when missing", async () => {
    jest
      .spyOn(UserService.prototype, "deleteUser")
      .mockRejectedValue({ statusCode: 404, message: "User not found" });
    const response = await request(app)
      .delete("/api/admin/users/u1")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(response.status).toBe(404);
  });
});
