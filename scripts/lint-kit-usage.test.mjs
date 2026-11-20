import assert from "node:assert/strict";
import { test } from "node:test";
import { applyBaseline, issueKey, scanSource } from "./lint-kit-usage.mjs";

const options = {
  components: new Map([["regular-list", new Map([["messageStatus", ["default", "failed"]]])]]),
  colorVariables: new Map([["--color-state-like", {}]]),
  assetExists: (asset) => asset === "/icons/list/failed-circle.svg",
};

const lint = (source, file = "apps/design-system-portal/src/components/kit/regular-list-item.tsx") =>
  scanSource(file, source, options);

test("validates Kit prop literals, color tokens, raw colors and icon paths", () => {
  const issues = lint(`
    <RegularListItem messageStatus="mention" style={{
      color: "var(--color-brand-secondary-a10)",
      background: "#123456"
    }} src="/icons/list/not-exist.svg" />
  `);
  assert.deepEqual(issues.map(({ rule }) => rule).sort(), ["KIT001", "KIT002", "KIT003", "KIT004"]);
  assert.ok(issues.every(({ line }) => line > 1));
});

test("checks union aliases, conditional expressions and class modifiers", () => {
  const issues = lint(`
    import { RegularListItem as Row } from "@/components/kit/regular-list-item";
    type Status = "default" | "mention";
    type Props = { messageStatus: Status };
    const row = <Row messageStatus={active ? "mention" : "failed"} className="regularListStatusIcon--mention" />;
  `);
  assert.deepEqual(issues.map(({ detail }) => detail), [
    "messageStatus=mention", "messageStatus=mention", "regularListStatusIcon--mention",
  ]);
});

test("allows documented styles and existing assets, skipping comments and interpolated asset prefixes", () => {
  assert.deepEqual(lint(`
    // "#123456" and "/icons/old.svg" are examples only.
    const icon = \`/icons/list/failed-\${name}.svg\`;
    <Row messageStatus="failed" style={{ color: "var(--color-state-like)" }} src="/icons/list/failed-circle.svg" />;
  `), []);
});

test("prevents a checked-in baseline from growing and tracks duplicate findings", () => {
  const [first, second] = lint('const a = "#123456"; const b = "#123456";');
  const key = issueKey(first);
  assert.deepEqual(applyBaseline([first, second], { [key]: 1 }, { [key]: 1 }).issues, [second]);
  assert.deepEqual(applyBaseline([], { [key]: 2 }, { [key]: 1 }).additions, [[key, 2]]);
  assert.deepEqual(applyBaseline([], {}, { [key]: 1 }).additions, []);
});
