import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../app";
import { ComplaintService } from "../services/complaint.service";
import { JWT_SECRET } from "../config";

const app = createApp();

function tokenFor(payload: Record<string, unknown>) {
  return jwt.sign(payload, JWT_SECRET);
}

describe("Complaint routes integration", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GET /api/complaints returns 401 without token", async () => {
    const response = await request(app).get("/api/complaints");
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("GET /api/complaints returns 401 for invalid token", async () => {
    const response = await request(app)
      .get("/api/complaints")
      .set("Authorization", "Bearer invalid-token");
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid token");
  });

  test("GET /api/complaints accepts auth cookie token", async () => {
    const spy = jest
      .spyOn(ComplaintService.prototype, "list")
      .mockResolvedValue([] as any);

    const token = tokenFor({ id: "user-1", role: "user" });
    const response = await request(app)
      .get("/api/complaints")
      .set("Cookie", [`auth_token=${token}`]);

    expect(response.status).toBe(200);
    expect(spy).toHaveBeenCalledWith({ id: "user-1", role: "user" });
  });

  test("GET /api/complaints returns complaint list", async () => {
    jest.spyOn(ComplaintService.prototype, "list").mockResolvedValue([
      { _id: "c1", title: "Network issue", status: "open" },
    ] as any);

    const token = tokenFor({ id: "admin-1", role: "admin" });
    const response = await request(app)
      .get("/api/complaints")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
  });

  test("GET /api/complaints returns 500 when service fails", async () => {
    jest
      .spyOn(ComplaintService.prototype, "list")
      .mockRejectedValue(new Error("DB unavailable"));

    const token = tokenFor({ id: "user-1", role: "user" });
    const response = await request(app)
      .get("/api/complaints")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/complaints returns 400 for invalid payload", async () => {
    const token = tokenFor({ id: "user-1", role: "user" });
    const response = await request(app)
      .post("/api/complaints")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "a" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/complaints creates complaint and injects userId from token", async () => {
    const createSpy = jest
      .spyOn(ComplaintService.prototype, "create")
      .mockResolvedValue({ _id: "c1", title: "Library noise" } as any);

    const token = tokenFor({ id: "user-7", role: "user" });
    const response = await request(app)
      .post("/api/complaints")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Library noise",
        category: "Library",
        location: "Block B",
        description: "Too much noise near study area",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Library noise",
        category: "Library",
        location: "Block B",
        description: "Too much noise near study area",
        userId: "user-7",
      })
    );
  });

  test("POST /api/complaints returns service status code error", async () => {
    jest
      .spyOn(ComplaintService.prototype, "create")
      .mockRejectedValue({ statusCode: 403, message: "Forbidden" });

    const token = tokenFor({ id: "user-7", role: "user" });
    const response = await request(app)
      .post("/api/complaints")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Network issue",
        category: "Internet",
        description: "No internet in lab",
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/complaints returns 500 on generic service error", async () => {
    jest
      .spyOn(ComplaintService.prototype, "create")
      .mockRejectedValue(new Error("Unexpected"));

    const token = tokenFor({ id: "user-7", role: "user" });
    const response = await request(app)
      .post("/api/complaints")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Water leakage",
        category: "Facility",
        description: "Water leakage in corridor",
      });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  test("GET /api/complaints/:id returns complaint details", async () => {
    jest.spyOn(ComplaintService.prototype, "getById").mockResolvedValue({
      _id: "c77",
      title: "Projector not working",
      status: "open",
    } as any);

    const token = tokenFor({ id: "admin-1", role: "admin" });
    const response = await request(app)
      .get("/api/complaints/c77")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data._id).toBe("c77");
  });

  test("GET /api/complaints/:id returns 404 when complaint is missing", async () => {
    jest
      .spyOn(ComplaintService.prototype, "getById")
      .mockRejectedValue({ statusCode: 404, message: "Complaint not found" });

    const token = tokenFor({ id: "admin-1", role: "admin" });
    const response = await request(app)
      .get("/api/complaints/not-found")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test("GET /api/complaints/:id returns 500 on generic error", async () => {
    jest
      .spyOn(ComplaintService.prototype, "getById")
      .mockRejectedValue(new Error("Unexpected"));

    const token = tokenFor({ id: "admin-1", role: "admin" });
    const response = await request(app)
      .get("/api/complaints/c1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
  });

  test("PUT /api/complaints/:id returns 400 for invalid update payload", async () => {
    const token = tokenFor({ id: "user-1", role: "user" });
    const response = await request(app)
      .put("/api/complaints/c1")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "closed" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("PUT /api/complaints/:id updates complaint", async () => {
    const updateSpy = jest
      .spyOn(ComplaintService.prototype, "update")
      .mockResolvedValue({ _id: "c1", status: "in_review" } as any);

    const token = tokenFor({ id: "admin-1", role: "admin" });
    const response = await request(app)
      .put("/api/complaints/c1")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "in_review", description: "Assigned to department" });

    expect(response.status).toBe(200);
    expect(updateSpy).toHaveBeenCalledWith(
      "c1",
      expect.objectContaining({
        status: "in_review",
        description: "Assigned to department",
      }),
      { id: "admin-1", role: "admin" }
    );
  });

  test("PUT /api/complaints/:id returns service status code error", async () => {
    jest
      .spyOn(ComplaintService.prototype, "update")
      .mockRejectedValue({ statusCode: 403, message: "Forbidden" });

    const token = tokenFor({ id: "user-9", role: "user" });
    const response = await request(app)
      .put("/api/complaints/c1")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "Trying to update other complaint" });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  test("PUT /api/complaints/:id returns 500 on generic error", async () => {
    jest
      .spyOn(ComplaintService.prototype, "update")
      .mockRejectedValue(new Error("Unexpected"));

    const token = tokenFor({ id: "admin-1", role: "admin" });
    const response = await request(app)
      .put("/api/complaints/c2")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "Updated note" });

    expect(response.status).toBe(500);
  });

  test("DELETE /api/complaints/:id deletes complaint", async () => {
    jest.spyOn(ComplaintService.prototype, "remove").mockResolvedValue(true as any);

    const token = tokenFor({ id: "admin-1", role: "admin" });
    const response = await request(app)
      .delete("/api/complaints/c1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Complaint deleted");
  });

  test("DELETE /api/complaints/:id returns 404 when complaint is missing", async () => {
    jest
      .spyOn(ComplaintService.prototype, "remove")
      .mockRejectedValue({ statusCode: 404, message: "Complaint not found" });

    const token = tokenFor({ id: "admin-1", role: "admin" });
    const response = await request(app)
      .delete("/api/complaints/c404")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test("DELETE /api/complaints/:id returns 403 when actor is forbidden", async () => {
    jest
      .spyOn(ComplaintService.prototype, "remove")
      .mockRejectedValue({ statusCode: 403, message: "Forbidden" });

    const token = tokenFor({ id: "user-5", role: "user" });
    const response = await request(app)
      .delete("/api/complaints/c9")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  test("DELETE /api/complaints/:id returns 401 for invalid token", async () => {
    const response = await request(app)
      .delete("/api/complaints/c9")
      .set("Authorization", "Bearer bad-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid token");
  });
});
