import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { FigmaDesign, FigmaNode, Rect, RGBA } from "../types.js";

type FigmaApiNode = {
  id: string;
  name: string;
  type: string;
  absoluteBoundingBox?: Rect;
  characters?: string;
  style?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    lineHeightPx?: number;
    textAlignHorizontal?: string;
  };
  opacity?: number;
  fills?: Array<{
    type: string;
    visible?: boolean;
    opacity?: number;
    color?: {
      r: number;
      g: number;
      b: number;
      a?: number;
    };
  }>;
  strokes?: FigmaApiNode["fills"];
  strokeWeight?: number;
  cornerRadius?: number | symbol;
  componentId?: string;
  componentProperties?: Record<string, { value?: string | boolean | number }>;
  layoutMode?: string;
  itemSpacing?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  constraints?: {
    horizontal?: string;
    vertical?: string;
  };
  boundVariables?: Record<
    string,
    { id?: string } | Array<{ id?: string }> | undefined
  >;
  children?: FigmaApiNode[];
};

type FigmaApiComponent = {
  key?: string;
  name?: string;
  description?: string;
  componentSetId?: string;
};

export function parseFigmaUrl(url: string): { fileKey: string; nodeId?: string } {
  const parsed = new URL(url);
  const parts = parsed.pathname.split("/").filter(Boolean);
  if (!parsed.hostname.endsWith("figma.com")) {
    throw new Error(`Not a Figma URL: ${url}`);
  }
  const fileKey = parts[2] === "branch" ? parts[3] : parts[1];
  const nodeId = parsed.searchParams.get("node-id")?.replace("-", ":") ?? undefined;

  if (!fileKey) {
    throw new Error(`Cannot parse Figma file key from URL: ${url}`);
  }

  return { fileKey, nodeId };
}

export async function resolveFigmaToken(explicitToken?: string): Promise<string> {
  const environmentToken = explicitToken || process.env.FIGMA_TOKEN;
  if (environmentToken) {
    return environmentToken;
  }
  try {
    const configPath =
      process.env.UI_AUDIT_CONFIG ||
      join(homedir(), ".config", "ui-audit", "config.json");
    const config = JSON.parse(await readFile(configPath, "utf8")) as {
      figmaToken?: string;
    };
    if (config.figmaToken) {
      return config.figmaToken;
    }
  } catch {
    // The local config is optional.
  }
  throw new Error(
    "Figma token is missing. Set FIGMA_TOKEN or ~/.config/ui-audit/config.json#figmaToken.",
  );
}

export async function fetchFigmaDesign(
  url: string,
  token: string,
): Promise<FigmaDesign> {
  const { fileKey, nodeId } = parseFigmaUrl(url);
  const apiUrl = nodeId
    ? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`
    : `https://api.figma.com/v1/files/${fileKey}`;

  const response = await fetch(apiUrl, {
    headers: {
      "X-Figma-Token": token,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API failed: ${response.status} ${await response.text()}`);
  }

  const payload = (await response.json()) as {
    name?: string;
    version?: string;
    lastModified?: string;
    document?: FigmaApiNode;
    nodes?: Record<
      string,
      {
        document: FigmaApiNode;
        components?: Record<string, FigmaApiComponent>;
      }
    >;
    components?: Record<string, FigmaApiComponent>;
  };
  const nodePayload = nodeId ? payload.nodes?.[nodeId] : undefined;
  const root = nodeId ? nodePayload?.document : payload.document;

  if (!root) {
    throw new Error(`Figma node not found: ${nodeId ?? "document"}`);
  }

  const designRoot = convertNode(
    root,
    nodePayload?.components ?? payload.components ?? {},
  );
  const design: FigmaDesign = {
    fileKey,
    nodeId: nodeId ?? root.id,
    frameName: designRoot.name,
    frame: designRoot.frame,
    designVersion: payload.version,
    lastModified: payload.lastModified,
    root: designRoot,
  };
  const screenshot = await fetchFigmaScreenshot(
    fileKey,
    design.nodeId ?? root.id,
    token,
  ).catch(() => undefined);
  if (screenshot) {
    design.screenshotData = screenshot.toString("base64");
    design.screenshotMimeType = "image/png";
  }
  return design;
}

function convertNode(
  node: FigmaApiNode,
  components: Record<string, FigmaApiComponent>,
): FigmaNode {
  const frame = node.absoluteBoundingBox ?? { x: 0, y: 0, width: 0, height: 0 };
  const component = components[node.componentId ?? node.id];
  const componentProperties = node.componentProperties
    ? Object.fromEntries(
        Object.entries(node.componentProperties).map(([key, property]) => [
          key,
          String(property.value ?? ""),
        ]),
      )
    : undefined;
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    frame,
    text: node.characters,
    color: firstSolidFill(node),
    backgroundColor: firstSolidFill(node),
    strokeColor: firstSolidStroke(node),
    strokeWeight: node.strokeWeight,
    opacity: node.opacity,
    fontSize: node.style?.fontSize,
    fontName: node.style?.fontFamily,
    fontWeight: node.style?.fontWeight,
    lineHeight: node.style?.lineHeightPx,
    textAlignHorizontal: node.style?.textAlignHorizontal,
    cornerRadius:
      typeof node.cornerRadius === "number" ? node.cornerRadius : undefined,
    componentId: node.componentId,
    componentName: component?.name,
    componentKey: component?.key,
    componentProperties,
    layoutMode: node.layoutMode,
    itemSpacing: node.itemSpacing,
    paddingTop: node.paddingTop,
    paddingRight: node.paddingRight,
    paddingBottom: node.paddingBottom,
    paddingLeft: node.paddingLeft,
    constraints: node.constraints,
    variableRefs: variableReferences(node.boundVariables),
    children: node.children?.map((child) => convertNode(child, components)),
  };
}

function firstSolidFill(node: FigmaApiNode): RGBA | undefined {
  const fill = node.fills?.find(
    (candidate) => candidate.type === "SOLID" && candidate.visible !== false && candidate.color,
  );
  return paintColor(fill);
}

function firstSolidStroke(node: FigmaApiNode): RGBA | undefined {
  const stroke = node.strokes?.find(
    (candidate) =>
      candidate.type === "SOLID" &&
      candidate.visible !== false &&
      candidate.color,
  );
  return paintColor(stroke);
}

function paintColor(
  paint: NonNullable<FigmaApiNode["fills"]>[number] | undefined,
): RGBA | undefined {
  if (!paint?.color) {
    return undefined;
  }
  const alpha = (paint.color.a ?? 1) * (paint.opacity ?? 1);
  return {
    r: Math.round(paint.color.r * 255),
    g: Math.round(paint.color.g * 255),
    b: Math.round(paint.color.b * 255),
    a: alpha,
  };
}

function variableReferences(
  variables: FigmaApiNode["boundVariables"],
): Record<string, string> | undefined {
  if (!variables) {
    return undefined;
  }
  const references: Record<string, string> = {};
  for (const [property, value] of Object.entries(variables)) {
    const identifier = Array.isArray(value) ? value[0]?.id : value?.id;
    if (identifier) {
      references[property] = identifier;
    }
  }
  return Object.keys(references).length ? references : undefined;
}

async function fetchFigmaScreenshot(
  fileKey: string,
  nodeId: string,
  token: string,
): Promise<Buffer> {
  const imageResponse = await fetch(
    `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=png&scale=2`,
    { headers: { "X-Figma-Token": token } },
  );
  if (!imageResponse.ok) {
    throw new Error(`Figma image API failed: ${imageResponse.status}`);
  }
  const imagePayload = (await imageResponse.json()) as {
    images?: Record<string, string | null>;
  };
  const imageURL = imagePayload.images?.[nodeId];
  if (!imageURL) {
    throw new Error(`Figma screenshot not found for node ${nodeId}`);
  }
  const assetResponse = await fetch(imageURL);
  if (!assetResponse.ok) {
    throw new Error(`Figma screenshot download failed: ${assetResponse.status}`);
  }
  return Buffer.from(await assetResponse.arrayBuffer());
}
