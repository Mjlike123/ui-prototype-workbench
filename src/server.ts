import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fetchFigmaDesign, resolveFigmaToken } from "./adapters/figma.js";
import { readDesignJson } from "./adapters/json.js";
import {
  LookinJsonCollector,
  RealLookinCollector,
  lookinIntegrationNotes,
} from "./adapters/lookin.js";
import { auditPage, auditScope, defaultConfig } from "./diff.js";
import { auditComponent } from "./component-audit.js";
import {
  loadComponentProfiles,
  resolveAuditProfile,
  resolveRuntimeAuditProfile,
  type ProfileDetection,
} from "./component-specs.js";
import { writeReport } from "./report.js";
import type {
  AuditConfig,
  AuditIssue,
  ComponentSemanticMapping,
  FigmaDesign,
  MatchPair,
  UiSnapshot,
} from "./types.js";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const webDir = join(rootDir, "web");
const defaultFigmaJson = "samples/figma-page.json";
const defaultUiJson = "samples/lookin-page.json";
const defaultOutDir = "out";
const defaultCapturedUiJson = "captured/current-lookin.json";

type SessionQuery = {
  figmaJson: string;
  uiJson: string;
  out: string;
  actualNodeId?: string;
};

type StoredAuditSession = {
  id: string;
  createdAt: string;
  figmaUrl: string;
  actual: UiSnapshot;
  design: FigmaDesign;
  matches: MatchPair[];
  issues: AuditIssue[];
  actualNodeId: string;
  auditProfile?: {
    id: string;
    version: string;
    title: string;
  };
  semanticMapping?: ComponentSemanticMapping[];
};

const auditSessions = new Map<string, StoredAuditSession>();

export function createAuditServer() {
  return createServer(async (request, response) => {
    try {
      await route(request, response);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      sendJson(response, status, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  createAuditServer().listen(4317, "127.0.0.1", () => {
    console.log("UI Audit Tool running at http://127.0.0.1:4317");
  });
}

async function route(request: IncomingMessage, response: ServerResponse) {
  const requestUrl = new URL(request.url ?? "/", "http://localhost");

  if (
    request.method === "POST" &&
    requestUrl.pathname === "/api/audit/ios-scope"
  ) {
    const payload = await auditIOSScope(await readJsonBody(request));
    sendJson(response, 200, payload);
    return;
  }

  if (
    request.method === "GET" &&
    requestUrl.pathname === "/api/audit/profiles"
  ) {
    const profiles = await loadComponentProfiles();
    sendJson(
      response,
      200,
      profiles.map((profile) => ({
        id: profile.id,
        version: profile.version,
        title: profile.title,
        status: profile.status,
        category: profile.category,
        platforms: profile.platforms,
        previewKey: profile.previewKey,
        ruleCount: profile.rules.length,
        figmaUrl: profile.reference?.figmaUrl,
      })),
    );
    return;
  }

  if (
    request.method === "POST" &&
    requestUrl.pathname === "/api/audit/export"
  ) {
    const payload = await exportStoredSession(await readJsonBody(request));
    sendJson(response, 200, payload);
    return;
  }

  if (requestUrl.pathname === "/api/session") {
    const query = parseSessionQuery(requestUrl);
    const payload = await buildSession(query);
    sendJson(response, 200, payload);
    return;
  }

  if (requestUrl.pathname === "/api/export") {
    const query = parseSessionQuery(requestUrl);
    const payload = await exportSession(query);
    sendJson(response, 200, payload);
    return;
  }

  if (requestUrl.pathname === "/api/audit-scope") {
    const query = parseSessionQuery(requestUrl);
    if (!query.actualNodeId) {
      throw new Error("actualNodeId is required");
    }
    const payload = await buildScopedAudit(query);
    sendJson(response, 200, payload);
    return;
  }

  if (requestUrl.pathname === "/api/connect-phone") {
    const query = parseConnectQuery(requestUrl);
    const payload = await connectPhone(query);
    sendJson(response, 200, payload);
    return;
  }

  if (requestUrl.pathname === "/download") {
    await downloadFile(requestUrl, response);
    return;
  }

  await serveStatic(requestUrl.pathname, response);
}

async function buildSession(query: SessionQuery) {
  const collector = new LookinJsonCollector(query.uiJson);
  const actual = await collector.collectCurrentPage();
  return buildSessionFromSnapshot(actual, {
    figmaJson: query.figmaJson,
    uiJson: query.uiJson,
    mode: "Lookin JSON export",
  });
}

async function buildSessionFromSnapshot(
  actual: UiSnapshot,
  source: { figmaJson: string; uiJson: string; mode: string },
) {
  const design = await readDesignJson(source.figmaJson);
  const audit = auditPage(design, actual);

  return {
    source,
    actual,
    design: audit.design,
    matches: audit.matches,
    issues: [],
    initialIssueCount: audit.issues.length,
    lookinIntegrationNotes,
  };
}

async function buildScopedAudit(query: SessionQuery) {
  if (!query.actualNodeId) {
    throw new Error("actualNodeId is required");
  }
  const collector = new LookinJsonCollector(query.uiJson);
  const actual = await collector.collectCurrentPage();
  const design = await readDesignJson(query.figmaJson);
  const audit = auditScope(design, actual, query.actualNodeId);
  return {
    source: {
      figmaJson: query.figmaJson,
      uiJson: query.uiJson,
      mode: "Scoped UI audit",
    },
    actual,
    design: audit.design,
    matches: audit.matches,
    issues: audit.issues,
    scope: audit.scope,
    lookinIntegrationNotes,
  };
}

async function auditIOSScope(body: unknown) {
  const request = asRecord(body);
  const providedFigmaUrl = optionalString(request.figmaUrl);
  const actual = validateSnapshot(request.actual);
  const actualNodeId =
    optionalString(request.actualNodeId) || actual.root.id;
  const requestedProfile = optionalString(request.auditProfile) || "auto";
  const config = configFromRequest(request.thresholds);
  let profileDetection: ProfileDetection =
    requestedProfile === "generic"
      ? { confidence: 1, reason: "manual-generic" }
      : await resolveRuntimeAuditProfile(requestedProfile, actual);
  const figmaUrl =
    providedFigmaUrl || profileDetection.profile?.reference?.figmaUrl;
  if (!figmaUrl) {
    const message = profileDetection.profile
      ? `Component profile "${profileDetection.profile.id}" has no reference.figmaUrl`
      : "Unable to recognize a Kit component from the selected Lookin module";
    throw new HttpError(
      422,
      `${message}. Select a component Profile or provide a Figma Frame URL.`,
    );
  }
  const figmaToken = await resolveFigmaToken();
  const rawDesign = await fetchFigmaDesign(figmaUrl, figmaToken);
  if (
    !profileDetection.profile &&
    requestedProfile !== "generic" &&
    providedFigmaUrl
  ) {
    profileDetection = await resolveAuditProfile(requestedProfile, rawDesign);
  }
  const componentAudit = profileDetection.profile
    ? auditComponent(
        rawDesign,
        actual,
        actualNodeId,
        profileDetection.profile,
      )
    : undefined;
  const genericAudit = componentAudit
    ? undefined
    : auditScope(rawDesign, actual, actualNodeId, config);
  const audit = componentAudit ?? genericAudit;
  if (!audit) {
    throw new Error("Failed to build audit result");
  }
  const sessionId = randomUUID();
  const session: StoredAuditSession = {
    id: sessionId,
    createdAt: new Date().toISOString(),
    figmaUrl,
    actual,
    design: audit.design,
    matches: audit.matches,
    issues: audit.issues,
    actualNodeId,
    auditProfile: componentAudit?.profile,
    semanticMapping: componentAudit?.semanticMapping,
  };
  auditSessions.set(sessionId, session);
  await persistSession(session);

  return {
    sessionId,
    createdAt: session.createdAt,
    source: {
      mode: componentAudit
        ? "Component profile audit"
        : "Generic selected subtree audit",
      figmaUrl,
      figmaNodeId: rawDesign.nodeId,
      designVersion: rawDesign.designVersion,
      referenceMode: providedFigmaUrl
        ? "figma-instance"
        : "kit-reference",
    },
    requestedProfile,
    profileDetection: {
      profileId: profileDetection.profile?.id,
      confidence: profileDetection.confidence,
      reason: profileDetection.reason,
    },
    profile: componentAudit?.profile,
    recognition: componentAudit?.recognition,
    semanticModels: componentAudit?.semanticModels,
    semanticMapping: componentAudit?.semanticMapping,
    debugIssues: componentAudit?.debugIssues ?? [],
    actual,
    design: audit.design,
    matches: audit.matches,
    issues: audit.issues,
    scope: audit.scope,
  };
}

async function exportStoredSession(body: unknown) {
  const request = asRecord(body);
  const sessionId = requiredString(request.sessionId, "sessionId");
  const session = auditSessions.get(sessionId);
  if (!session) {
    throw new HttpError(404, `Audit session not found: ${sessionId}`);
  }
  const exportAll = request.exportAll === true;
  const confirmedIssueIds = new Set(
    Array.isArray(request.confirmedIssueIds)
      ? request.confirmedIssueIds.filter(
          (value): value is string => typeof value === "string",
        )
      : [],
  );
  if (!exportAll && confirmedIssueIds.size === 0) {
    throw new HttpError(
      400,
      "confirmedIssueIds must contain at least one issue, or set exportAll to true",
    );
  }

  const issues = exportAll
    ? session.issues.map((issue) => ({ ...issue }))
    : session.issues
        .filter((issue) => confirmedIssueIds.has(issue.id))
        .map((issue) => ({ ...issue, status: "confirmed" as const }));
  if (issues.length === 0) {
    throw new HttpError(
      400,
      exportAll
        ? "This audit session has no issues to export"
        : "None of the confirmed issue IDs belong to this session",
    );
  }

  const outputDir = join(rootDir, defaultOutDir, "sessions", session.id);
  const report = await writeReport(issues, session.actual, outputDir, {
    design: session.design,
    profile: session.auditProfile,
  });
  if (!exportAll) {
    session.issues = session.issues.map((issue) =>
      confirmedIssueIds.has(issue.id)
        ? { ...issue, status: "confirmed" }
        : issue,
    );
    await persistSession(session);
  }

  return {
    sessionId,
    issueCount: issues.length,
    exportAll,
    csvPath: resolve(report.csvPath),
    annotationPaths: report.annotationPaths.map((path) => resolve(path)),
    csvDownloadUrl: `/download?file=${encodeURIComponent(
      report.csvPath.slice(rootDir.length + 1),
    )}`,
  };
}

async function persistSession(session: StoredAuditSession) {
  const sessionDir = join(rootDir, defaultOutDir, "sessions", session.id);
  await mkdir(sessionDir, { recursive: true });
  const sanitized = {
    ...session,
    actual: stripScreenshotData(session.actual),
    design: {
      ...session.design,
      screenshotData: session.design.screenshotData ? "[stored separately]" : undefined,
    },
  };
  await writeFile(
    join(sessionDir, "session.json"),
    JSON.stringify(sanitized, null, 2),
    "utf8",
  );
  if (session.actual.screenshotData) {
    await writeFile(
      join(sessionDir, "actual.png"),
      Buffer.from(session.actual.screenshotData, "base64"),
    );
  }
  if (session.design.screenshotData) {
    await writeFile(
      join(sessionDir, "design.png"),
      Buffer.from(session.design.screenshotData, "base64"),
    );
  }
}

async function connectPhone(query: {
  figmaJson: string;
  out: string;
  bundleId?: string;
  mode: "usb" | "simulator" | "both";
}) {
  const binaryPath = process.env.LOOKIN_COLLECTOR_BIN || join(rootDir, "bin/lookin-collector");
  const collector = new RealLookinCollector({
    binaryPath,
    mode: query.mode,
    bundleId: query.bundleId,
  });
  const actual = await collector.collectCurrentPage();
  await mkdir(join(rootDir, "captured"), { recursive: true });
  await writeFile(
    join(rootDir, defaultCapturedUiJson),
    JSON.stringify(actual, null, 2),
    "utf8",
  );

  const session = await buildSessionFromSnapshot(actual, {
    figmaJson: query.figmaJson,
    uiJson: defaultCapturedUiJson,
    mode: "Lookin live phone collector",
  });

  return {
    ...session,
    capturedPath: defaultCapturedUiJson,
    collectorBinary: binaryPath,
  };
}

async function exportSession(query: SessionQuery) {
  await mkdir(query.out, { recursive: true });
  const session = query.actualNodeId ? await buildScopedAudit(query) : await buildSession(query);
  const report = await writeReport(session.issues, session.actual, query.out);
  const csv = await readFile(report.csvPath, "utf8");

  return {
    csvPath: report.csvPath,
    csvDownloadUrl: `/download?file=${encodeURIComponent(report.csvPath)}`,
    annotationPaths: report.annotationPaths,
    annotationDownloadUrls: report.annotationPaths.map(
      (path) => `/download?file=${encodeURIComponent(path)}`,
    ),
    csv,
  };
}

function parseSessionQuery(url: URL): SessionQuery {
  return {
    figmaJson: url.searchParams.get("figmaJson") || defaultFigmaJson,
    uiJson: url.searchParams.get("uiJson") || defaultUiJson,
    out: url.searchParams.get("out") || defaultOutDir,
    actualNodeId: url.searchParams.get("actualNodeId") || undefined,
  };
}

function parseConnectQuery(url: URL): {
  figmaJson: string;
  out: string;
  bundleId?: string;
  mode: "usb" | "simulator" | "both";
} {
  const mode = url.searchParams.get("mode") || "both";
  if (mode !== "usb" && mode !== "simulator" && mode !== "both") {
    throw new Error(`Unsupported collector mode: ${mode}`);
  }
  return {
    figmaJson: url.searchParams.get("figmaJson") || defaultFigmaJson,
    out: url.searchParams.get("out") || defaultOutDir,
    bundleId: url.searchParams.get("bundleId") || undefined,
    mode,
  };
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 50 * 1024 * 1024) {
      throw new HttpError(413, "Request body exceeds 50 MB");
    }
    chunks.push(buffer);
  }
  if (chunks.length === 0) {
    throw new HttpError(400, "JSON request body is required");
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "Invalid JSON request body");
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "Expected a JSON object");
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, `${field} is required`);
  }
  return value.trim();
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : undefined;
}

function validateSnapshot(value: unknown): UiSnapshot {
  const snapshot = asRecord(value);
  const root = asRecord(snapshot.root);
  const device = asRecord(snapshot.device);
  requiredString(root.id, "actual.root.id");
  if (
    typeof device.width !== "number" ||
    typeof device.height !== "number"
  ) {
    throw new HttpError(400, "actual.device width and height are required");
  }
  return snapshot as UiSnapshot;
}

function configFromRequest(value: unknown): AuditConfig {
  if (!value) {
    return defaultConfig;
  }
  const thresholds = asRecord(value);
  const merged = { ...defaultConfig.thresholds };
  for (const key of Object.keys(merged) as Array<
    keyof AuditConfig["thresholds"]
  >) {
    const candidate = thresholds[key];
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      merged[key] = candidate;
    }
  }
  return { thresholds: merged };
}

function stripScreenshotData(snapshot: UiSnapshot): UiSnapshot {
  const stripNode = (node: UiSnapshot["root"]): UiSnapshot["root"] => {
    const { screenshotData: _screenshotData, ...rest } = node;
    return {
      ...rest,
      children: node.children?.map(stripNode),
    };
  };
  const { screenshotData: _screenshotData, ...rest } = snapshot;
  return {
    ...rest,
    root: stripNode(snapshot.root),
  };
}

async function serveStatic(pathname: string, response: ServerResponse) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = safeResolve(webDir, safePath);
  const fileStat = await stat(filePath);
  if (!fileStat.isFile()) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentType(filePath),
  });
  createReadStream(filePath).pipe(response);
}

async function downloadFile(url: URL, response: ServerResponse) {
  const relative = url.searchParams.get("file");
  if (!relative) {
    sendJson(response, 400, { error: "Missing file" });
    return;
  }

  const filePath = safeResolve(rootDir, relative);
  const fileStat = await stat(filePath);
  if (!fileStat.isFile()) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentType(filePath),
    "Content-Disposition": `attachment; filename="${filePath.split("/").pop() ?? "download"}"`,
  });
  createReadStream(filePath).pipe(response);
}

function safeResolve(baseDir: string, pathValue: string): string {
  const stripped = pathValue.replace(/^\/+/, "");
  const resolved = resolve(baseDir, normalize(stripped));
  if (!resolved.startsWith(baseDir)) {
    throw new Error("Path escapes project root");
  }
  return resolved;
}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body, null, 2));
}

function contentType(filePath: string): string {
  switch (extname(filePath)) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".csv":
      return "text/csv; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
