import assert from "node:assert/strict";
import { after, test } from "node:test";
import { buildApp } from "../src/app.js";
import { ZERO_ADDRESS } from "../src/config.js";

const app = buildApp({ logger: false });
after(async () => {
  await app.close();
});

const owner = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

test("GET /health returns service status", async () => {
  const res = await app.inject({ method: "GET", url: "/health" });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json(), {
    status: "OK",
    service: "wizard-api",
    stack: "DripForge Wizard"
  });
});

test("POST /analyze generates FUNDING.json and a splits proposal", async () => {
  const res = await app.inject({
    method: "POST",
    url: "/analyze",
    payload: {
      name: "my-drips-project",
      version: "1.0.0",
      dependencies: {
        lodash: "^4.17.21",
        zod: "^3.22.4"
      },
      drips: {
        ethereum: { ownedBy: owner }
      }
    }
  });

  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.drips.ethereum.ownedBy, owner);
  assert.equal(body._metadata.projectName, "my-drips-project");
  assert.equal(body._metadata.dependenciesCount, 2);
  assert.equal(body.splitsProposal.totalWeight, 1_000_000);
  assert.equal(body.splitsProposal.ownerWeight, 800_000);
  assert.equal(body.splitsProposal.dependencyPoolWeight, 200_000);
  assert.equal(body.splitsProposal.dependencies.length, 2);
  const weightSum = body.splitsProposal.dependencies.reduce(
    (sum: number, dep: { suggestedWeight: number }) => sum + dep.suggestedWeight,
    0
  );
  assert.equal(weightSum, 200_000);
  assert.deepEqual(body.warnings, []);
});

test("POST /analyze warns when owner is missing", async () => {
  const res = await app.inject({
    method: "POST",
    url: "/analyze",
    payload: { name: "unowned", dependencies: {} }
  });

  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.drips.ethereum.ownedBy, ZERO_ADDRESS);
  assert.equal(body.warnings.length, 1);
  assert.match(body.warnings[0], /zero address/i);
});

test("POST /analyze rejects an invalid owner address", async () => {
  const res = await app.inject({
    method: "POST",
    url: "/analyze",
    payload: {
      name: "bad-owner",
      drips: { ethereum: { ownedBy: "not-an-address" } }
    }
  });

  assert.equal(res.statusCode, 422);
  assert.match(res.json().error, /Ethereum address/i);
});

test("POST /analyze rejects a package.json without a name", async () => {
  const res = await app.inject({
    method: "POST",
    url: "/analyze",
    payload: { version: "1.0.0" }
  });

  assert.equal(res.statusCode, 400);
});

test("GET /analyze accepts a packageJson query parameter", async () => {
  const packageJson = JSON.stringify({
    name: "query-project",
    drips: { ethereum: { ownedBy: owner } }
  });
  const res = await app.inject({
    method: "GET",
    url: `/analyze?packageJson=${encodeURIComponent(packageJson)}`
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.json()._metadata.projectName, "query-project");
  assert.equal(res.json().splitsProposal.dependencyPoolWeight, 0);
  assert.equal(res.json().splitsProposal.ownerWeight, 1_000_000);
});
