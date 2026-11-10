# Figma 节点 Token 自动审计

用于 TopTop Agent 通过 Figma MCP 创建、修改或验收页面后的非阻断式自动检查。当前只负责发现并报告问题，不自动修复，也不阻止交付。

## 自动触发

- Agent 对 Figma 页面、Section、Frame、组件或实例完成一次写入后；
- `toptop-design-review` 的 Pass 2 输入包含 Figma 节点时；
- 用户明确要求检查颜色 Token 或导航背景时。

审计目标必须是本次任务的最小根节点，不能无差别扫描整个文件。

## Check 1：硬编码颜色

扫描目标节点及其可见后代的 `fills`、`strokes` 与 `effects`：

- 颜色已绑定 Variable，或节点使用共享 Paint/Effect Style：通过；
- 图片、视频等非颜色 Paint：忽略；
- 未绑定 Variable/Style 的可见颜色：记录为硬编码；
- 目标实例内部的硬编码颜色单独归类为 `componentInternal`，提示回源组件修复；
- 页面直接图层、Prototype 图层和实例根节点上的硬编码颜色归类为 `actionable`；
- 彩色业务素材可能合法，但仍保留为审计结果，由合同或素材清单说明豁免，审计器不通过名称猜测豁免。

每条结果至少包含 node id、node name、node type、属性、Paint 类型、颜色和分类。

## Check 2：导航背景 Token

自动识别名称、主组件名或组件集名包含以下语义，且不属于 Bottom Navigation/Tab 的节点：

- `常规导航`、`一级导航`、`导航栏`
- `Regular Navigation`、`Primary Navigation`、`Navigation Bar`

检查导航根容器 `fills` 的 Variable 绑定：

- 绑定 Variable 名称为 `背景色/bgPrimary`：通过；
- 无绑定、绑定其他 Variable、无可检查背景：分别报告；
- 不检查标题、图标和尾部操作的透明背景。

## 输出合同

结果写入 `baselineEvidence.figmaAudit`：

```yaml
figmaAudit:
  rootNodeId: "123:456"
  scannedNodes: 42
  hardcodedColors:
    actionableCount: 2
    componentInternalCount: 5
    findings: []
  navigationBgPrimary:
    checked: 1
    passed: 1
    failed: 0
    findings: []
  blocking: false
```

即使没有发现问题，也要记录零值结果。当前 `blocking` 固定为 `false`。

## Figma MCP 执行模板

调用前必须读取 `figma-use` Skill，并通过 `use_figma` 执行。把 `ROOT_NODE_ID` 替换为本次任务的最小根节点 ID。

```js
const ROOT_NODE_ID = "ROOT_NODE_ID";
const MAX_FINDINGS_PER_KIND = 80;

let root = null;
for (const page of figma.root.children) {
  await figma.setCurrentPageAsync(page);
  root = await figma.getNodeByIdAsync(ROOT_NODE_ID);
  if (root) break;
}
if (!root || root.type === "DOCUMENT" || root.type === "PAGE") {
  throw new Error(`Auditable Figma node not found: ${ROOT_NODE_ID}`);
}

const nodes = [root];
$fig.query("*", root).each((node) => nodes.push(node));

function isEffectivelyVisible(node) {
  let cursor = node;
  while (cursor && cursor.type !== "DOCUMENT") {
    if ("visible" in cursor && cursor.visible === false) return false;
    if ("opacity" in cursor && cursor.opacity === 0) return false;
    if (cursor.id === root.id) break;
    cursor = cursor.parent;
  }
  return true;
}

function isStyleBacked(node, property) {
  const styleProp =
    property === "fills"
      ? "fillStyleId"
      : property === "strokes"
        ? "strokeStyleId"
        : "effectStyleId";
  return (
    styleProp in node &&
    typeof node[styleProp] === "string" &&
    node[styleProp].length > 0
  );
}

function paintAliasId(node, property, paint, index) {
  const direct = paint?.boundVariables?.color;
  if (direct?.id) return direct.id;
  const binding = node.boundVariables?.[property];
  const indexed = Array.isArray(binding) ? binding[index] : binding;
  return indexed?.id || null;
}

function nearestInstanceAncestor(node) {
  let cursor = node.parent;
  while (cursor && cursor.id !== root.id && cursor.type !== "DOCUMENT") {
    if (cursor.type === "INSTANCE") return cursor;
    cursor = cursor.parent;
  }
  return null;
}

function colorToHex(color, opacity = 1) {
  if (!color) return null;
  const byte = (value) =>
    Math.max(0, Math.min(255, Math.round(value * 255)))
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  const alpha = byte(opacity);
  return `#${byte(color.r)}${byte(color.g)}${byte(color.b)}${
    alpha === "FF" ? "" : alpha
  }`;
}

const actionable = [];
const componentInternal = [];
let actionableCount = 0;
let componentInternalCount = 0;

function recordHardcoded(node, property, paintType, color, opacity) {
  const internal = nearestInstanceAncestor(node);
  const finding = {
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    property,
    paintType,
    color: colorToHex(color, opacity),
    classification: internal ? "componentInternal" : "actionable",
    instanceAncestorId: internal?.id || null,
  };
  if (internal) {
    componentInternalCount += 1;
    if (componentInternal.length < MAX_FINDINGS_PER_KIND) {
      componentInternal.push(finding);
    }
  } else {
    actionableCount += 1;
    if (actionable.length < MAX_FINDINGS_PER_KIND) {
      actionable.push(finding);
    }
  }
}

for (const node of nodes) {
  if (!isEffectivelyVisible(node)) continue;

  for (const property of ["fills", "strokes"]) {
    if (!(property in node) || node[property] === figma.mixed) continue;
    if (isStyleBacked(node, property)) continue;
    const paints = Array.isArray(node[property]) ? node[property] : [];
    paints.forEach((paint, index) => {
      if (paint.visible === false || paint.opacity === 0) return;
      if (paint.type === "SOLID") {
        if (!paintAliasId(node, property, paint, index)) {
          recordHardcoded(
            node,
            property,
            "SOLID",
            paint.color,
            paint.opacity ?? 1,
          );
        }
        return;
      }
      if (
        paint.type === "GRADIENT_LINEAR" ||
        paint.type === "GRADIENT_RADIAL" ||
        paint.type === "GRADIENT_ANGULAR" ||
        paint.type === "GRADIENT_DIAMOND"
      ) {
        paint.gradientStops.forEach((stop, stopIndex) => {
          if (!stop.boundVariables?.color?.id) {
            recordHardcoded(
              node,
              `${property}.gradientStops[${stopIndex}]`,
              paint.type,
              stop.color,
              stop.color.a ?? 1,
            );
          }
        });
      }
    });
  }

  if (
    "effects" in node &&
    node.effects !== figma.mixed &&
    Array.isArray(node.effects) &&
    !isStyleBacked(node, "effects")
  ) {
    node.effects.forEach((effect, index) => {
      if (
        effect.visible !== false &&
        "color" in effect &&
        !effect.boundVariables?.color?.id
      ) {
        recordHardcoded(
          node,
          `effects[${index}]`,
          effect.type,
          effect.color,
          effect.color.a ?? 1,
        );
      }
    });
  }
}

function navigationIdentity(node) {
  const main = node.type === "INSTANCE" ? node.mainComponent : null;
  return [
    node.name,
    main?.name,
    main?.parent?.type === "COMPONENT_SET" ? main.parent.name : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function isNavigationRoot(node) {
  if (
    !["FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE"].includes(node.type)
  ) {
    return false;
  }
  const identity = navigationIdentity(node);
  const matches =
    /(常规导航|一级导航|导航栏|regular\s*navigation|primary\s*navigation|navigation\s*bar)/i.test(
      identity,
    );
  const excluded = /(底部|bottom|tab)/i.test(identity);
  return matches && !excluded;
}

function fillAliasIds(node) {
  const ids = new Set();
  const binding = node.boundVariables?.fills;
  const bindings = Array.isArray(binding) ? binding : binding ? [binding] : [];
  bindings.forEach((alias) => {
    if (alias?.id) ids.add(alias.id);
  });
  if ("fills" in node && node.fills !== figma.mixed) {
    const paints = Array.isArray(node.fills) ? node.fills : [];
    paints.forEach((paint) => {
      if (paint?.boundVariables?.color?.id) {
        ids.add(paint.boundVariables.color.id);
      }
    });
  }
  return [...ids];
}

const navigationFindings = [];
for (const node of nodes.filter(isNavigationRoot)) {
  const variableNames = [];
  for (const id of fillAliasIds(node)) {
    const variable = await figma.variables.getVariableByIdAsync(id);
    if (variable) variableNames.push(variable.name);
  }
  const passed = variableNames.includes("背景色/bgPrimary");
  navigationFindings.push({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: passed
      ? "pass"
      : variableNames.length > 0
        ? "wrongVariable"
        : "unboundOrMissingFill",
    variables: variableNames,
    expected: "背景色/bgPrimary",
  });
}

return {
  version: 1,
  rootNodeId: root.id,
  rootNodeName: root.name,
  scannedNodes: nodes.length,
  hardcodedColors: {
    actionableCount,
    componentInternalCount,
    actionable,
    componentInternal,
    truncated:
      actionableCount > actionable.length ||
      componentInternalCount > componentInternal.length,
  },
  navigationBgPrimary: {
    checked: navigationFindings.length,
    passed: navigationFindings.filter((item) => item.status === "pass").length,
    failed: navigationFindings.filter((item) => item.status !== "pass").length,
    findings: navigationFindings,
  },
  blocking: false,
};
```
