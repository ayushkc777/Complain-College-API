import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("App health endpoints integration", () => {
  test("GET / returns welcome payload", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe("true");
    expect(response.body.message).toBe("Welcome to the API");
  });

  test("GET /health returns ok status with timestamp", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe("ok");
    expect(typeof response.body.timestamp).toBe("string");
  });

  test("GET /health does not expose x-powered-by header", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });
});
