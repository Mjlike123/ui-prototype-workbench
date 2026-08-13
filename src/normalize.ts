import { round } from "./geometry.js";
import type { FigmaDesign, FigmaNode, Rect, UiSnapshot } from "./types.js";

export function normalizeFigmaToDevice(
  design: FigmaDesign,
  actual: UiSnapshot,
): FigmaDesign {
  const actualRootFrame = actual.root.frameToRoot ?? actual.root.frame;
  const targetWidth =
    actualRootFrame.width > 0 ? actualRootFrame.width : actual.device.width;
  const factor = targetWidth / Math.max(1, design.frame.width);

  return {
    ...design,
    frame: normalizeRect(design.frame, design.frame, actualRootFrame, factor),
    root: normalizeNode(
      design.root,
      design.frame,
      actualRootFrame,
      factor,
    ),
  };
}

function normalizeNode(
  node: FigmaNode,
  designRootFrame: Rect,
  actualRootFrame: Rect,
  factor: number,
): FigmaNode {
  return {
    ...node,
    frame: normalizeRect(node.frame, designRootFrame, actualRootFrame, factor),
    children: node.children?.map((child) =>
      normalizeNode(child, designRootFrame, actualRootFrame, factor),
    ),
  };
}

function normalizeRect(
  frame: Rect,
  designRootFrame: Rect,
  actualRootFrame: Rect,
  factor: number,
): Rect {
  return {
    x: round(
      actualRootFrame.x + (frame.x - designRootFrame.x) * factor,
    ),
    y: round(
      actualRootFrame.y + (frame.y - designRootFrame.y) * factor,
    ),
    width: round(frame.width * factor),
    height: round(frame.height * factor),
  };
}
