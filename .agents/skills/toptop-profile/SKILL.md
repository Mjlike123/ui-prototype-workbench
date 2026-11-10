---
name: toptop-profile
description: Supplies TopTop product terminology, design-system sources, prototype boundaries, output locations, and validation policy to ix-designer-core. Use only as the TopTop business profile in a composed IX design workflow.
disable-model-invocation: true
---

# TopTop business profile

Load `profile.yaml`, then apply it to `ix-designer-core`.

## Authority order

1. `specs/principles/core-design-principles.yaml`
2. relevant `specs/foundations/*.yaml`
3. relevant `specs/components/<id>.yaml`
4. component `interactionIds` → `specs/interactions/<id>.yaml`
5. matching `content/` guidance
6. real Kit, shared prototype modules, and Core page implementations
7. approved feature specs and historical design research

Structured YAML is the contract. MDX and previews explain it but cannot override it.

## Shared baseline entry

Every TopTop IX, implementation, and acceptance-review workflow must read
`../toptop-design-system/references/mdesign-baseline.md` through this Profile.
It is the shared adoption boundary and hard-baseline checklist for M-Design
references; its summaries never override the structured contracts above.

Apply it at these gates:

- **IX**: lock applicable viewport, gutter, spacing, icon, Token, touch-target,
  state, and recovery requirements into `RequirementBrief.qualityBar`,
  `creativeLatitude.locked`, and `designSystemMapping`.
- **Implementation**: use it as the preflight checklist before component
  mapping, then verify rendered bounds, Tokens, canonical icons, Safe Area,
  interaction states, and observable completion.
- **Review**: keep Pass 1 screenshot-blind; read the baseline in Pass 2 and
  require evidence for every applicable hard baseline.

If a user request or approved business screen conflicts with a structured
contract, preserve the business objective, record the conflict, and request or
route the required contract change. Do not silently make the screen or current
implementation the new system rule.

## Figma automatic checks

After every Agent-authored Figma write, and during Pass 2 of a Figma review,
automatically run
`../toptop-design-system/references/figma-node-token-audit.md` against the
smallest task root node:

1. report visible hardcoded colors separately as actionable page layers and
   component-internal source issues;
2. verify every Primary/Regular Navigation root is bound to
   `背景色/bgPrimary`.

Write the result to `baselineEvidence.figmaAudit`. These checks are currently
non-blocking: report findings and do not silently repair or suppress them.

## TopTop-specific behavior

- Reuse order: Core page → shared business module → Kit component/pattern → Foundation primitive → isolated `Prototype*` gap.
- Existing Kit internals cannot be restyled by prototype-local CSS.
- Studio is the default destination for IX prototypes. Do not register experiments in Core.
- Use semantic Tokens and canonical icons.
- Default every new page, Prototype, and unspecified regional context to `color.brand.primary` (`#16D8C8`). Tokens under `color.ku.*` and `color.brand.tw-*` are regional/package overrides and require an explicit requirement, existing-screen contract, or confirmed business profile; never infer them from locale, copy, or visual preference.
- Record uncovered behavior as `kitGap`; do not invent a component ID or lifecycle status.
- Validate actual DOM bounds, computed Tokens, interaction transitions, focus, safe areas, and reduced motion.
- For selected visual directions, apply `qualityPolicy`: authentic non-duplicated content, completed primary flow, 44pt touch targets, target-viewport screenshots, and two screenshot-led review passes before delivery.

## Input extensions

- Feishu/Lark documents may use the `lark-doc` capability when the active adapter provides it.
- Local PDFs may use `scripts/ingest-pdf.mjs`.
- Figma references require an authorized design-reader capability.
- Missing proprietary input access falls back to exported text, PDF, or images.

## Downstream routing

- Larger page/visual gaps → `toptop-prototype-studio`
- Strict Kit implementation → `toptop-design-system`
- Read-only acceptance review → `toptop-design-review`
- Screenshot-to-Kit mapping → `page-canvas-vision`

TopTop rules refine the Core workflow; they do not replace its requirement, interaction, traceability, or accessibility semantics.
