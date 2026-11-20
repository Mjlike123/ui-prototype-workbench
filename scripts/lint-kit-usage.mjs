import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import ts from "typescript";
import { parse } from "yaml";

const root = fileURLToPath(new URL("../", import.meta.url));
const portal = "apps/design-system-portal";
const source = portal + "/src";
const kit = source + "/components/kit";
const baselinePath = "scripts/kit-lint-baseline.json";
const checkedDirectories = [
  kit,
  source + "/components/prototypes",
  source + "/app/prototypes",
  source + "/app/prototype-runtime",
];

const componentAliases = {
  "avatar-visual": "avatar",
  "bottom-navigation-icon": "bottom-navigation",
  "message-list-status": "regular-list",
  "regular-list-item": "regular-list",
  "underline-secondary-tab": "secondary-tab-underline",
};

const variantClassOwners = {
  avatarVisual: ["avatar"],
  bottomNavigation: ["bottom-navigation"],
  chatBubble: ["chat-bubble", "kind", "direction"],
  chatBubbleAction: ["chat-bubble", "actionState"],
  chatBubbleDelivery: ["chat-bubble", "deliveryStatus"],
  imageEmptyState: ["image-empty-state"],
  regularListItem: ["regular-list", "listType"],
  regularListStatusIcon: ["regular-list", "messageStatus"],
  regularNavigation: ["regular-navigation"],
  secondaryTabUnderline: ["secondary-tab-underline"],
};

const colors = /#[0-9a-f]{3,8}\b|\brgba?\([^)]*\)/gi;
const tokenReferences = /var\(\s*(--color-[\w-]+)/g;
const iconReferences = /\/icons\/[^\s"'`()<>{}?#;,]+/g;
const selectors = /\.(-?[_a-zA-Z][\w-]*)/g;

function readYaml(repositoryRoot, file) {
  return parse(readFileSync(join(repositoryRoot, file), "utf8"));
}

export function getColorVariables(repositoryRoot = root) {
  const { tokens } = readYaml(repositoryRoot, "specs/foundations/colors.yaml");
  return new Map(tokens.flatMap((token) => {
    const match = /^var\((--[\w-]+)\)$/.exec(token.platforms?.h5 ?? "");
    return match ? [[match[1], token]] : [];
  }));
}

function sourceFiles(repositoryRoot, directory) {
  const path = join(repositoryRoot, directory);
  if (!existsSync(path)) return [];
  return readdirSync(path, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.[cm]?[jt]sx?$/.test(entry.name))
    .map((entry) => relative(repositoryRoot, join(entry.parentPath, entry.name)))
    .filter((file) => !/\.(?:test|spec|d)\.[cm]?[jt]sx?$/.test(file) && !file.includes("/generated/"))
    .sort();
}

function componentMap(repositoryRoot) {
  const directory = "specs/components";
  return new Map(readdirSync(join(repositoryRoot, directory))
    .filter((file) => /\.ya?ml$/.test(file))
    .map((file) => readYaml(repositoryRoot, join(directory, file)))
    .map((spec) => [spec.id, new Map((spec.variants ?? []).map(({ name, values }) => [name, values.map(String)]))]));
}

function nameOfComponent(path, components) {
  const name = basename(path).replace(/\.[cm]?[jt]sx?$/, "");
  const component = componentAliases[name] ?? name;
  return components.has(component) ? component : undefined;
}

function literalValues(node) {
  if (!node) return [];
  if (ts.isStringLiteralLike(node) || ts.isNumericLiteral(node)) return [[node.text, node]];
  if (ts.isLiteralTypeNode(node)) return literalValues(node.literal);
  if (ts.isJsxExpression(node) || ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) return literalValues(node.expression);
  if (ts.isUnionTypeNode(node)) return node.types.flatMap(literalValues);
  if (ts.isConditionalExpression(node)) return [...literalValues(node.whenTrue), ...literalValues(node.whenFalse)];
  return [];
}

function classIndex() {
  return { names: new Set(), prefixes: new Set() };
}

function addClasses(index, value, templatePrefix = false) {
  for (const [name] of value.matchAll(/\b[a-zA-Z][\w-]*\b/g)) {
    index.names.add(name);
  }
  if (templatePrefix) {
    const prefix = /\b([a-zA-Z][\w-]*--)\s*$/.exec(value)?.[1];
    if (prefix) index.prefixes.add(prefix);
    const extendedPrefix = /\b([a-zA-Z][\w-]*--[\w-]*-)\s*$/.exec(value)?.[1];
    if (extendedPrefix) index.prefixes.add(extendedPrefix);
  }
}

function selectorClasses(selector) {
  return [...selector.matchAll(selectors)].map(([, name]) => name);
}

function matchesClasses(selector, index) {
  return selectorClasses(selector).some((name) =>
    index.names.has(name) || [...index.prefixes].some((prefix) => name.startsWith(prefix)));
}

function scanValues(value, colorVariables, assetExists, report) {
  for (const [, variable] of value.matchAll(tokenReferences)) {
    if (!colorVariables.has(variable)) report("KIT001", variable);
  }
  const colorValue = value.replace(/url\([^)]*\)/gi, "");
  for (const [color] of colorValue.matchAll(colors)) {
    if (color.startsWith("#") && ![4, 5, 7, 9].includes(color.length)) continue;
    report("KIT002", color.toLowerCase().replace(/\s+/g, ""));
  }
  for (const [asset] of value.matchAll(iconReferences)) {
    if (!asset.endsWith("/") && !assetExists(asset)) report("KIT004", asset);
  }
}

function scanClassVariant(name, components, report) {
  const separator = name.indexOf("--");
  if (separator < 0) return;
  const base = name.slice(0, separator);
  const modifier = name.slice(separator + 2);
  const owner = variantClassOwners[base];
  if (!owner || !modifier) return;
  const [component, ...props] = owner;
  const variants = components.get(component);
  if (!variants) return;
  const values = props.length ? props.flatMap((prop) => variants.get(prop) ?? []) : [...variants.values()].flat();
  const prefixed = /^(leading|trailing)-(.+)$/.exec(modifier);
  const allowed = prefixed && component === "regular-navigation"
    ? variants.get(prefixed[1] + "Action")?.includes(prefixed[2])
    : values.includes(modifier);
  if (!allowed) report("KIT003", name);
}

export function scanSource(file, content, { components, colorVariables, assetExists, classes }) {
  const parsed = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  const diagnostics = [];
  const localComponent = nameOfComponent(file, components);
  const importedComponents = new Map();
  const literalTypes = new Map();
  const statements = parsed.statements;
  for (const statement of statements) {
    if (ts.isTypeAliasDeclaration(statement)) literalTypes.set(statement.name.text, statement.type);
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const path = statement.moduleSpecifier.text;
    const component = nameOfComponent(path, components);
    const bindings = statement.importClause?.namedBindings;
    if (component && bindings && ts.isNamedImports(bindings) &&
        (path.includes("/kit/") || path.startsWith("./") && file.startsWith(kit + "/"))) {
      for (const binding of bindings.elements) {
        importedComponents.set(binding.name.text, component);
      }
    }
  }

  // JSX calls normally resolve through a Kit import. This also catches a
  // distinctive Kit prop when it is used through a wrapper component.
  const checkVariant = (component, prop, node) => {
    const allowed = component
      ? components.get(component)?.get(prop)
      : prop === "messageStatus" ? components.get("regular-list")?.get(prop) : undefined;
    if (!allowed) return;
    const type = node && ts.isTypeReferenceNode(node)
      ? literalTypes.get(node.typeName.getText(parsed)) : node;
    for (const [value, location] of literalValues(type)) {
      if (!allowed.includes(value)) reportAt(location, "KIT003", prop + "=" + value);
    }
  };

  function reportAt(node, rule, detail) {
    const { line, character } = parsed.getLineAndCharacterOfPosition(node.getStart(parsed));
    diagnostics.push({ file, line: line + 1, column: character + 1, rule, detail, severity: "error" });
  }

  function visit(node) {
    if (ts.isStringLiteralLike(node) || ts.isTemplateLiteralToken(node)) {
      const value = node.text;
      const report = (rule, detail) => reportAt(node, rule, detail);
      const beforeInterpolation = node.kind === ts.SyntaxKind.TemplateHead ||
        node.kind === ts.SyntaxKind.TemplateMiddle;
      const literal = beforeInterpolation ? value.replace(/\/icons\/[^\s"'<>()]+$/, "") : value;
      scanValues(literal, colorVariables, assetExists, report);
      if (classes) addClasses(classes, value, ts.isTemplateLiteralToken(node));
      for (const [name] of value.matchAll(/\b[a-zA-Z][\w-]*--[\w-]+/g)) {
        if (!name.endsWith("-")) scanClassVariant(name, components, report);
      }
    }
    if (ts.isJsxAttribute(node)) {
      const tag = node.parent.parent.tagName.getText(parsed);
      // Imported subcomponents can expose their own, separately typed variants.
      if (tag !== "ChatReplyPreview") {
        checkVariant(importedComponents.get(tag), node.name.getText(parsed), node.initializer);
      }
    }
    if (ts.isPropertySignature(node) && node.parent.parent.name?.text !== "ChatReplyPreviewProps") {
      checkVariant(localComponent, node.name.getText(parsed), node.type);
    }
    if (ts.isBindingElement(node) && node.initializer) {
      checkVariant(localComponent, (node.propertyName ?? node.name).getText(parsed), node.initializer);
    }
    ts.forEachChild(node, visit);
  }

  visit(parsed);
  return diagnostics;
}

function isReducedMotion(declaration) {
  let ancestor = declaration.parent;
  while (ancestor) {
    if (ancestor.type === "atrule" && ancestor.name === "media" &&
        /prefers-reduced-motion\s*:\s*reduce\b/.test(ancestor.params)) return true;
    ancestor = ancestor.parent;
  }
  return false;
}

function hasUnspecifiedMotion(property, value, requireTokens) {
  if (!/^(?:animation|transition)(?:-(?:duration|delay|timing-function))?$/.test(property)) return false;
  if (/^(?:none|initial|inherit|unset|revert(?:-layer)?)$/.test(value)) return false;
  return postcss.list.comma(value).some((part) => {
    const clean = part.replace(/var\(--motion-(?:duration|easing)-[\w-]+\)/g, "");
    const hasRawValue = /(?:^|[\s(])[-+.\d]+m?s\b|\b(?:ease(?:-in|-out|-in-out)?|linear|step-start|step-end|cubic-bezier|steps)\b/.test(clean);
    if (hasRawValue) return true;
    if (!requireTokens) return false;
    const duration = /var\(--motion-duration-[\w-]+\)/.test(part);
    const easing = /var\(--motion-easing-[\w-]+\)/.test(part);
    if (property.endsWith("-timing-function")) return !easing;
    if (property.endsWith("-duration") || property.endsWith("-delay")) return !duration;
    return !duration || !easing;
  });
}

function cssDiagnostics(file, css, { components, colorVariables, assetExists, kitClasses, applicationClasses, portalClasses, strictPortalMotion }) {
  const diagnostics = [];
  css.walkRules((rule) => {
    const appRule = file.endsWith("/globals.css") && matchesClasses(rule.selector, applicationClasses);
    const portalRule = strictPortalMotion && (file.endsWith("/portal-b2b.css") || matchesClasses(rule.selector, portalClasses));
    if (!appRule && !portalRule) return;
    for (const declaration of rule.nodes) {
      if (declaration.type !== "decl") continue;
      const { prop, value } = declaration;
      const scope = file.endsWith("/globals.css") && matchesClasses(rule.selector, kitClasses) ? "kit" : "prototype";
      const report = (id, detail, severity = "error") => {
        const { line, column } = declaration.source.start;
        diagnostics.push({
          file, line, column, rule: id, detail, severity, scope: portalRule ? "portal" : scope,
          context: rule.selector.replace(/\s+/g, " ") + " { " + prop + ": " + value.replace(/\s+/g, " ") + " }",
        });
      };
      if (appRule) scanValues(value, colorVariables, assetExists, report);
      if (hasUnspecifiedMotion(prop, value, true) && !isReducedMotion(declaration)) {
        report("KIT005", prop + ": " + value.replace(/\s+/g, " "), portalRule ? "error" : "warning");
      }
    }
    if (appRule) {
      for (const name of selectorClasses(rule.selector)) {
        scanClassVariant(name, components, (id, detail) => {
          diagnostics.push({ file, ...rule.source.start, rule: id, detail, context: rule.selector, severity: "error" });
        });
      }
    }
  });
  return diagnostics;
}

function sourceIndex(files, repositoryRoot) {
  const parsed = classIndex();
  for (const file of files) {
    const content = readFileSync(join(repositoryRoot, file), "utf8");
    scanSource(file, content, {
      classes: parsed, components: new Map(), colorVariables: new Map(), assetExists: () => true,
    });
  }
  // Common state modifiers describe the element they are attached to.
  for (const name of ["active", "disabled", "selected", "light", "dark", "open", "close", "button", "input"]) {
    parsed.names.delete(name);
  }
  return parsed;
}

export function collectIssues(repositoryRoot = root, { strictPortalMotion = false } = {}) {
  const components = componentMap(repositoryRoot);
  const colorVariables = getColorVariables(repositoryRoot);
  const assetExists = (asset) => {
    const path = join(repositoryRoot, portal, "public", asset);
    return !asset.split("/").includes("..") && existsSync(path);
  };
  const kitFiles = sourceFiles(repositoryRoot, kit);
  const files = checkedDirectories.flatMap((directory) => sourceFiles(repositoryRoot, directory));
  const kitClasses = sourceIndex(kitFiles, repositoryRoot);
  const applicationClasses = sourceIndex(files, repositoryRoot);
  const portalClasses = sourceIndex([
    source + "/components/app-shell.tsx",
    source + "/components/component-card.tsx",
    source + "/components/component-section-nav.tsx",
    source + "/app/page.tsx",
    ...["components", "foundations", "search", "audit", "getting-started", "principles", "governance", "interactions"]
      .flatMap((route) => sourceFiles(repositoryRoot, source + "/app/" + route)),
  ].filter((file) => existsSync(join(repositoryRoot, file))), repositoryRoot);
  for (const name of ["button", "filterChip", "foundationQuickTab", "visualInspectionViewTabs", "visualInspectionFilters", "visualInspectionInput"]) {
    portalClasses.names.add(name);
  }

  const options = { components, colorVariables, assetExists };
  const diagnostics = files.flatMap((file) =>
    scanSource(file, readFileSync(join(repositoryRoot, file), "utf8"), options));
  for (const name of ["globals.css", "portal-b2b.css"]) {
    const file = source + "/app/" + name;
    if (!existsSync(join(repositoryRoot, file))) continue;
    const css = postcss.parse(readFileSync(join(repositoryRoot, file), "utf8"), { from: file });
    diagnostics.push(...cssDiagnostics(file, css, { ...options, kitClasses, applicationClasses, portalClasses, strictPortalMotion }));
  }
  return diagnostics;
}

export function issueKey(issue) {
  return [issue.rule, issue.file, issue.context ?? "", issue.detail].join(" | ");
}

export function applyBaseline(diagnostics, baseline, previous) {
  const additions = Object.entries(baseline).filter(([key, count]) =>
    !Number.isSafeInteger(count) || count < 1 || previous && count > (previous[key] ?? 0));
  const counts = new Map();
  const issues = diagnostics.filter((issue) => {
    if (issue.severity !== "error" || issue.scope === "portal" && issue.rule === "KIT005") return true;
    const key = issueKey(issue);
    const count = (counts.get(key) ?? 0) + 1;
    counts.set(key, count);
    return count > (baseline[key] ?? 0);
  });
  return { issues, additions };
}

function readGitBaseline(ref) {
  try {
    return JSON.parse(execFileSync("git", ["show", ref + ":" + baselinePath], {
      cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }));
  } catch (error) {
    if (error.status === 128) return undefined;
    throw error;
  }
}

function main() {
  const baseline = JSON.parse(readFileSync(join(root, baselinePath), "utf8"));
  const diagnostics = collectIssues(root, { strictPortalMotion: false });
  const head = readGitBaseline("HEAD");
  const parent = readGitBaseline("HEAD^");
  const base = process.env.GITHUB_BASE_REF
    ? readGitBaseline("origin/" + process.env.GITHUB_BASE_REF)
    : undefined;
  const { issues, additions } = applyBaseline(diagnostics, baseline, head);
  for (const reference of [parent, base].filter(Boolean)) {
    const growth = applyBaseline([], baseline, reference).additions;
    for (const entry of growth) {
      if (!additions.some(([key]) => key === entry[0])) additions.push(entry);
    }
  }

  const errors = issues.filter(({ severity }) => severity === "error").length;
  const warnings = issues.length - errors;
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ errors, warnings, issues, baselineAdditions: additions }, null, 2));
  } else {
    for (const issue of issues) {
      console.log(issue.file + ":" + issue.line + ":" + issue.column + " " + issue.severity + " " + issue.rule + " " + issue.detail);
    }
    for (const [entry] of additions) console.error("Kit lint baseline cannot grow: " + entry);
    console.log("Kit lint: " + errors + " errors, " + warnings + " warnings, " + additions.length + " baseline additions.");
  }
  process.exitCode = errors || additions.length ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
