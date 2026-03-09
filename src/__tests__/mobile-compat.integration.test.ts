import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../app";
import { UserService } from "../services/user.service";
import { JWT_SECRET } from "../config";

const app = createApp();

function tokenFor(payload: Record<string, unknown>) {
  return jwt.sign(payload, JWT_SECRET);
}

describe("Mobile compatibility routes integration", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GET /api/v1/batches returns static batch list", async () => {
    const response = await request(app).get("/api/v1/batches");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("GET /api/v1/batches returns expected number of batches", async () => {
    const response = await request(app).get("/api/v1/batches");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(4);
    expect(response.body.data[0]).toHaveProperty("batchName");
  });

  test("POST /api/v1/students returns 400 when email is missing", async () => {
    const response = await request(app).post("/api/v1/students").send({
      password: "secret1",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/v1/students returns 400 when password is missing", async () => {
    const response = await request(app).post("/api/v1/students").send({
      email: "student@college.edu",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/v1/students creates student with derived username", async () => {
    const spy = jest
      .spyOn(UserService.prototype, "createUser")
      .mockResolvedValue({ _id: "u1", email: "student@college.edu" } as any);

    const response = await request(app).post("/api/v1/students").send({
      name: "Aayush KC",
      email: "student@college.edu",
      password: "secret1",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Aayush",
        lastName: "KC",
        email: "student@college.edu",
        username: "student",
        password: "secret1",
        confirmPassword: "secret1",
      })
    );
  });

  test("POST /api/v1/students trims and lowercases email before create", async () => {
    const spy = jest
      .spyOn(UserService.prototype, "createUser")
      .mockResolvedValue({ _id: "u2" } as any);

    const response = await request(app).post("/api/v1/students").send({
      name: "Test User",
      email: "  STUDENT2@COLLEGE.EDU ",
      password: "secret1",
    });

    expect(response.status).toBe(201);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "student2@college.edu",
        username: "student2",
      })
    );
  });

  test("POST /api/v1/students keeps custom username and confirmPassword", async () => {
    const spy = jest
      .spyOn(UserService.prototype, "createUser")
      .mockResolvedValue({ _id: "u3" } as any);

    const response = await request(app).post("/api/v1/students").send({
      name: "Custom User",
      email: "custom@college.edu",
      username: "customUsername",
      password: "secret1",
      confirmPassword: "secret2",
    });

    expect(response.status).toBe(201);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "customUsername",
        confirmPassword: "secret2",
      })
    );
  });

  test("POST /api/v1/students returns service status code", async () => {
    jest
      .spyOn(UserService.prototype, "createUser")
      .mockRejectedValue({ statusCode: 403, message: "Email already in use" });

    const response = await request(app).post("/api/v1/students").send({
      email: "dup@college.edu",
      password: "secret1",
    });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/v1/students returns 500 on generic error", async () => {
    jest
      .spyOn(UserService.prototype, "createUser")
      .mockRejectedValue(new Error("Unexpected"));

    const response = await request(app).post("/api/v1/students").send({
      email: "x@college.edu",
      password: "secret1",
    });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/v1/students/login returns 400 when email is missing", async () => {
    const response = await request(app).post("/api/v1/students/login").send({
      password: "secret1",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/v1/students/login returns 400 when password is missing", async () => {
    const response = await request(app).post("/api/v1/students/login").send({
      email: "student@college.edu",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/v1/students/login returns token and user data", async () => {
    jest.spyOn(UserService.prototype, "loginUser").mockResolvedValue({
      token: "jwt-token",
      user: { _id: "u1", email: "student@college.edu" },
    } as any);

    const response = await request(app).post("/api/v1/students/login").send({
      email: "student@college.edu",
      password: "secret1",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBe("jwt-token");
    expect(response.body.data.email).toBe("student@college.edu");
  });

  test("POST /api/v1/students/login normalizes email before service call", async () => {
    const spy = jest.spyOn(UserService.prototype, "loginUser").mockResolvedValue({
      token: "jwt-token",
      user: { _id: "u1" },
    } as any);

    const response = await request(app).post("/api/v1/students/login").send({
      email: "  STUDENT@COLLEGE.EDU ",
      password: "secret1",
    });

    expect(response.status).toBe(200);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "student@college.edu",
        password: "secret1",
      })
    );
  });

  test("POST /api/v1/students/login returns service status code", async () => {
    jest
      .spyOn(UserService.prototype, "loginUser")
      .mockRejectedValue({ statusCode: 401, message: "Invalid credentials" });

    const response = await request(app).post("/api/v1/students/login").send({
      email: "student@college.edu",
      password: "secret1",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/v1/students/login returns 500 on generic error", async () => {
    jest
      .spyOn(UserService.prototype, "loginUser")
      .mockRejectedValue(new Error("Unexpected"));

    const response = await request(app).post("/api/v1/students/login").send({
      email: "student@college.edu",
      password: "secret1",
    });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/v1/items/upload-photo returns 401 without auth", async () => {
    const response = await request(app).post("/api/v1/items/upload-photo");
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/v1/items/upload-photo returns 401 with invalid token", async () => {
    const response = await request(app)
      .post("/api/v1/items/upload-photo")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid token");
  });

  test("POST /api/v1/items/upload-photo returns 400 when file is missing", async () => {
    const token = tokenFor({ id: "user-1", role: "user" });
    const response = await request(app)
      .post("/api/v1/items/upload-photo")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Please upload a photo file");
  });

  test("POST /api/v1/items/upload-photo accepts cookie token auth", async () => {
    const token = tokenFor({ id: "user-2", role: "user" });
    const response = await request(app)
      .post("/api/v1/items/upload-photo")
      .set("Cookie", [`auth_token=${token}`]);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
