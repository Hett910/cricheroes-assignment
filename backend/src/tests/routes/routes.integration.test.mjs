// tests/routes.integration.test.mjs
import request from "supertest";
import app from "../../app.js";

// Integration tests for API routes
describe("API routes (integration)", () => {
  it("GET /api/teams returns teams list", async () => {
    const res = await request(app).get("/api/teams");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("teams");
    expect(Array.isArray(res.body.teams)).toBe(true);
  });

  it("POST /api/scenario invalid payload returns 400", async () => {
    const res = await request(app).post("/api/scenario").send({ yourTeam: "" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("POST /api/scenario valid payload returns 200/422 or scenario", async () => {
    // use a valid body that your mocked service can handle
    const body = {
      yourTeam: "A",
      opponentTeam: "B",
      totalOvers: 20,
      desiredPosition: 3,
      toss: "batting-first",
      runs: 100,
    };
    const res = await request(app).post("/api/scenario").send(body);
    // Successful behavior depends on your service; at least check status is 200 or 422 handled earlier
    expect([200, 422]).toContain(res.status);
  });
});

// Basic integration test for app health route
describe('App integration', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(404);
  });
});