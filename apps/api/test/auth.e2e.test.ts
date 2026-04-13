import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import supertest from "supertest";
import { createTestApp } from "./support/test-app";

describe("auth flow", () => {
  const appsToClose = new Set<Awaited<ReturnType<typeof createTestApp>>>();

  afterEach(async () => {
    for (const context of appsToClose) {
      await context.app.close();
    }

    appsToClose.clear();
  });

  it("rotates refresh tokens and revokes the previous refresh token", async () => {
    const context = await createTestApp();
    appsToClose.add(context);

    const request = supertest(context.app.getHttpServer());

    const loginResponse = await request.post("/api/auth/login").send({
      email: "owner@tracker.local",
      password: "changeme123",
    });

    assert.equal(loginResponse.status, 201);
    assert.equal(loginResponse.body.user.email, "owner@tracker.local");
    assert.equal(loginResponse.body.organizations.length, 1);

    const firstRefreshToken = loginResponse.body.tokens.refreshToken as string;

    const refreshResponse = await request.post("/api/auth/refresh").send({
      refreshToken: firstRefreshToken,
    });

    assert.equal(refreshResponse.status, 201);
    assert.notEqual(refreshResponse.body.refreshToken, firstRefreshToken);
    assert.ok(refreshResponse.body.accessToken);

    const revokedRefreshResponse = await request.post("/api/auth/refresh").send({
      refreshToken: firstRefreshToken,
    });

    assert.equal(revokedRefreshResponse.status, 401);

    const meResponse = await request
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${refreshResponse.body.accessToken as string}`);

    assert.equal(meResponse.status, 200);
    assert.equal(meResponse.body.user.name, "Tracker Owner");
  });
});
