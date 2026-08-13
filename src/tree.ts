import type { FigmaNode, UiNode } from "./types.js";

export function flattenUi(root: UiNode): UiNode[] {
  return flatten(root);
}

export function flattenFigma(root: FigmaNode): FigmaNode[] {
  return flatten(root);
}

function flatten<T extends { children?: T[] }>(root: T): T[] {
  const nodes: T[] = [];
  const visit = (node: T) => {
    nodes.push(node);
    for (const child of node.children ?? []) {
      visit(child);
    }
  };
  visit(root);
  return nodes;
}

export function textKey(value?: string): string {
  return (value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

export function normalizeName(value?: string): string {
  return (value ?? "")
    .replace(/[#/_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
