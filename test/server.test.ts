import { request as httpRequest } from "node:http";
import { readFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAuditServer } from "../src/server.js";
import type { UiSnapshot } from "../src/types.js";

describe("Lookin native audit API", () => {
  const originalToken = process.env.FIGMA_TOKEN;

  beforeEach(() => {
    process.env.FIGMA_TOKEN = "test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = String(input);
        if (url.includes("/v1/files/") && url.includes("/nodes")) {
          const nodeId = url.includes("13468%3A186458")
            ? "13468:186458"
            : "1:2";
          return Response.json({
            version: "42",
            lastModified: "2026-07-17T00:00:00Z",
            nodes: {
              [nodeId]: {
                document: {
                  id: nodeId,
                  name: "Secondary Tab",
                  type: "FRAME",
                  absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 100 },
                  children: [
                    {
                      id: "1:3",
                      name: "title",
                      type: "TEXT",
                      characters: "Hello",
                      absoluteBoundingBox: { x: 10, y: 10, width: 40, height: 18 },
                      style: {
                        fontSize: 12,
                        fontFamily: "PingFang SC",
                        fontWeight: 400,
                      },
                      fills: [
                        {
                          type: "SOLID",
                          color: { r: 0, g: 0, b: 0, a: 1 },
                        },
                      ],
                    },
                  ],
                },
                components: {
                  [nodeId]: {
                    key: "secondary-tab",
                    name: "Secondary Tab",
                  },
                },
              },
            },
          });
        }
        if (url.includes("/v1/images/")) {
          return Response.json({
            images: {
              "1:2": "https://assets.test/card.png",
              "13468:186458": "https://assets.test/card.png",
            },
          });
        }
        if (url === "https://assets.test/card.png") {
          return new Response(new Uint8Array([137, 80, 78, 71]));
        }
        throw new Error(`Unexpected fetch: ${url}`);
      }),
    );
  });

  afterEach(() => {
    process.env.FIGMA_TOKEN = originalToken;
    vi.unstubAllGlobals();
  });

  it("audits a posted selected subtree and exports confirmed issues", async () => {
    const server = createAuditServer();
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const port = (server.address() as AddressInfo).port;

    try {
      const profiles = await getJson(port, "/api/audit/profiles");
      expect(profiles.status).toBe(200);
      expect(profiles.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "secondary-tab",
            version: "1.2.0",
            status: "review",
            platforms: ["ios", "android", "h5"],
            ruleCount: 9,
            previewKey: "secondary-tab-pill",
          }),
        ]),
      );

      const actual: UiSnapshot = {
        pageName: "TopTop Test",
        device: { width: 100, height: 100, scale: 2 },
        screenshotData: Buffer.from("runtime-image").toString("base64"),
        root: {
          id: "lookin-1",
          lookinOid: "1",
          name: "CardView",
          type: "UIView",
          frame: { x: 0, y: 0, width: 100, height: 100 },
          children: [
            {
              id: "lookin-2",
              lookinOid: "2",
              name: "title",
              type: "UILabel",
              classChain: ["UILabel", "UIView"],
              frame: { x: 10, y: 10, width: 52, height: 22 },
              text: "Hello",
              fontSize: 15,
              fontName: "PingFangSC-Regular",
              fontWeight: 400,
              color: { r: 0, g: 0, b: 0, a: 1 },
            },
          ],
        },
      };

      const audit = await postJson(port, "/api/audit/ios-scope", {
        figmaUrl:
          "https://www.figma.com/design/file-key/TopTop?node-id=1-2",
        actual,
        actualNodeId: "lookin-1",
      });

      expect(audit.status).toBe(200);
      expect(audit.body.sessionId).toEqual(expect.any(String));
      expect(audit.body.source.designVersion).toBe("42");
      expect(audit.body.profile).toMatchObject({
        id: "secondary-tab",
        version: "1.2.0",
      });
      expect(audit.body.debugIssues).toEqual(expect.any(Array));
      expect(audit.body.issues.length).toBeGreaterThan(0);
      expect(audit.body.issues[0]).toMatchObject({
        confidence: expect.any(Number),
        status: expect.stringMatching(/open|needs_confirmation/),
      });

      const issueId = audit.body.issues[0].id as string;
      const exported = await postJson(port, "/api/audit/export", {
        sessionId: audit.body.sessionId,
        confirmedIssueIds: [issueId],
      });

      expect(exported.status).toBe(200);
      expect(exported.body.issueCount).toBe(1);
      const csv = await readFile(exported.body.csvPath as string, "utf8");
      expect(csv).toContain(issueId);
      expect(csv).toContain("已确认");
      expect(csv).toContain("secondary-tab@1.2.0");

      const exportAll = await postJson(port, "/api/audit/export", {
        sessionId: audit.body.sessionId,
        exportAll: true,
      });
      expect(exportAll.status).toBe(200);
      expect(exportAll.body.issueCount).toBe(audit.body.issues.length);
      expect(exportAll.body.exportAll).toBe(true);

      const kitAudit = await postJson(port, "/api/audit/ios-scope", {
        actual: {
          ...actual,
          root: {
            ...actual.root,
            name: "TTSecondaryTabView",
            type: "TTSecondaryTabView",
            classChain: ["TTSecondaryTabView", "UIView"],
            accessibilityIdentifier: "audit.secondaryTab",
          },
        },
        actualNodeId: "lookin-1",
        auditProfile: "auto",
      });

      expect(kitAudit.status).toBe(200);
      expect(kitAudit.body.source).toMatchObject({
        referenceMode: "kit-reference",
        figmaNodeId: "13468:186458",
      });
      expect(kitAudit.body.profileDetection).toMatchObject({
        profileId: "secondary-tab",
        confidence: 1,
        reason: "ios-accessibility-identifier",
      });
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });
});

async function getJson(
  port: number,
  path: string,
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const request = httpRequest(
      { host: "127.0.0.1", port, path, method: "GET" },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 0,
            body: JSON.parse(Buffer.concat(chunks).toString("utf8")),
          });
        });
      },
    );
    request.on("error", reject);
    request.end();
  });
}

async function postJson(
  port: number,
  path: string,
  body: unknown,
): Promise<{ status: number; body: Record<string, any> }> {
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const request = httpRequest(
      {
        host: "127.0.0.1",
        port,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 0,
            body: JSON.parse(Buffer.concat(chunks).toString("utf8")),
          });
        });
      },
    );
    request.on("error", reject);
    request.end(payload);
  });
}
