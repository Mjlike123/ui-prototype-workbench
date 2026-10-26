---
name: ix-designer-core
description: Platform-neutral interaction design workflow that turns PRDs, documents, screenshots, design files, URLs, or conversation into traceable requirements, UX/UI specifications, and component-aligned functional prototypes. Use with one business profile and one agent adapter; never assume a specific design system, repository, or tool provider.
disable-model-invocation: true
---

# IX Designer Core

This Skill owns the reusable interaction-design method. It does not own brand rules, component names, repository paths, or tool syntax.

## Required composition

Before execution, resolve:

1. **Business profile** — design-system sources, product terminology, output policy, prototype policy, and review gates.
2. **Agent adapter** — available capabilities and the concrete tools that provide them.
3. **User request** — scope, target platform, expected fidelity, and requested deliverables.

Read `references/composition-contract.md`. Stop only when a required capability has no adapter and no documented fallback.

## Invariants

- Preserve source traceability and confidence. Never turn inference into fact.
- Separate user-visible behavior, unchanged context, visual direction, and implementation detail.
- Search the active business profile before inventing components, Tokens, patterns, or page structures.
- Reuse the profile's components and interaction patterns when they satisfy the intended semantics.
- Record uncovered component, page, visual, or interaction behavior as an explicit gap.
- Keep UX decisions independent from Agent-platform tool syntax.
- Generate production code only when the active profile and user authorization allow it.

## Six-phase workflow

### 0. Ingest

Use the adapter capability matching each input: `document.read`, `pdf.read`, `image.inspect`, `design.read`, `url.fetch`, or `conversation.read`.

Normalize sources into `RequirementBrief` using `specs/requirement-brief.schema.yaml`. For multiple sources, merge by feature and page identity; preserve conflicts.

### 1. Frame the requirement

Classify every relevant statement:

- `newBehavior`
- `existingModified`
- `existingUnchanged`
- `visualDirection`
- `designImpact`
- `ignoredItem`
- `uncertain`

Translate technical and operational statements into UX constraints when they affect loading, errors, permissions, compatibility, content priority, moderation, localization, or perceived performance.

For a new page, redesign, or material visual change, add `qualityBar` to the brief. It must name the product category, primary task, first-screen hero, product-specific design cue, content/asset requirements, benchmark patterns to adopt or avoid, and observable acceptance criteria. Keep visual art direction separate from interaction facts; vague adjectives are not acceptance criteria.

Present the page inventory, primary flow, assumptions, and open questions. Apply the profile's confirmation gate.

### 2. Research

When the feature uses a mature pattern or the user asks for references:

1. Search the profile's internal knowledge sources.
2. Search external sources only when policy and adapter permit it.
3. Separate observed evidence from recommendations.
4. Produce `adopt`, `avoid`, and `needsValidation`.

Do not copy competitor visuals or protected assets.

### 3. Model interaction and UI

Use `specs/interaction-spec.schema.yaml`.

For every page and overlay define:

- purpose, entry, exit, and terminal conditions;
- default, loading, success, empty, error, disabled, permission, and offline states when applicable;
- semantic elements and accessible names;
- trigger → transition → feedback → result;
- dismiss, cancellation, recovery, focus, keyboard, localization, and reduced-motion behavior.

Before proposing UI, query the profile in this order:

1. existing full page or flow;
2. shared business module;
3. design-system component and interaction pattern;
4. Foundation Token and accessible primitive;
5. isolated prototype gap.

Write the result to `designSystemMapping`; include source identifiers and gaps.

### 4. Review and improve

Review:

- task completion and information architecture;
- consistency with the active design system;
- state and transition completeness;
- accessibility and localization;
- failure recovery and destructive actions;
- feasibility and scope integrity.

Classify changes as `design-completion`, `ux-improvement`, or `needs-product-confirm`. Do not silently change product policy.

### 5. Deliver

Use output locations and formats from the business profile. Default deliverables:

- human-readable UX design document;
- machine-readable interaction specification;
- runnable functional prototype when `prototype.render` is available and authorized;
- optional brief, research, review report, or wireframes.

The prototype must use the active profile's real components, Tokens, and interaction contracts where available. Validate rendered behavior, not source code alone.
When a `qualityBar` exists, include the selected direction, content/asset gaps, target-viewport screenshots, and review evidence in the handoff. A main task that ends only in placeholder feedback is not a completed functional prototype.

## Capability fallback

- Missing proprietary document reader → request export as text, PDF, or images.
- Missing design-file reader → use exported frames plus documented variables.
- Missing repository access → produce mapping requirements, not fabricated component IDs.
- Missing prototype renderer → deliver interaction spec and implementation-ready component mapping.
- Missing browser/runtime verification → mark rendered measurements as unverified.

## Handoff

Report:

- active profile and adapter;
- sources and confidence;
- pages and primary flow;
- reused pages/modules/components/Tokens/patterns;
- unresolved gaps and decisions;
- generated artifacts;
- validation evidence and unavailable checks.

## References

- `references/composition-contract.md`
- `references/profile-authoring.md`
- `references/deliverables.md`
- `specs/requirement-brief.schema.yaml`
- `specs/interaction-spec.schema.yaml`
- `specs/business-profile.schema.yaml`
- `specs/agent-adapter.schema.yaml`
