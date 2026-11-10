---
version: alpha
name: TopTop Design System
description: TopTop Kit 的 Agent 可读设计入口，覆盖语义 Token、组件选择、交互、响应式、无障碍与 Kit 缺口处理。
colors:
  primary: "#16D8C8"
  "color.brand.primary-a10": "rgba(22, 216, 200, 0.1)"
  "color.brand.primary-a50": "#8AECE3"
  "color.brand.primary-dark": "#12ADA0"
  "color.text.primary": "#181923"
  "color.text.secondary": "#8B8C91"
  "color.text.tertiary": "#BABABD"
  "color.text.auxiliary": "#A3A5B1"
  "color.text.white-primary": "#FFFFFF"
  "color.surface.panel": "#FFFFFF"
  "color.surface.canvas": "#F7F8FA"
  "color.button.primary": "#F3F5F9"
  "color.button.secondary": "rgba(24, 25, 35, 0.04)"
  "color.border.subtle": "rgba(24, 25, 35, 0.04)"
  "color.border.image": "rgba(24, 25, 35, 0.1)"
  "color.toast.background": "rgba(47, 48, 57, 0.9)"
  "color.state.like": "#FF2E60"
  "color.switch.track-on": "#34C759"
  "color.switch.track-off": "#CFCFCF"
  "color.search-control.container-background": "transparent"
  "color.search-control.field-background": "rgba(24, 25, 35, 0.04)"
  "color.search-control.placeholder": "#BABABD"
typography:
  "typography.heading.page":
    fontFamily: Inter, PingFang SC, sans-serif
    fontSize: 28px
    fontWeight: 600
    lineHeight: 36px
  "typography.heading.section":
    fontFamily: Inter, PingFang SC, sans-serif
    fontSize: 18px
    fontWeight: 600
    lineHeight: 26px
  "typography.body.regular":
    fontFamily: Inter, PingFang SC, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 22px
  "typography.body.semibold":
    fontFamily: SF Pro, PingFang SC, sans-serif
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
  "typography.button.large":
    fontFamily: SF Pro, PingFang SC, sans-serif
    fontSize: 16px
    fontWeight: 590
    lineHeight: 16px
  "typography.button.small":
    fontFamily: SF Pro, PingFang SC, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 14px
  "typography.button.mini":
    fontFamily: SF Pro, PingFang SC, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 12px
  "typography.input.search":
    fontFamily: SF Pro, PingFang SC, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 20px
  "typography.input.chat":
    fontFamily: SF Pro, PingFang SC, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 20px
  "typography.list.title":
    fontFamily: SF Pro, PingFang SC, sans-serif
    fontSize: 16px
    fontWeight: 590
    lineHeight: 20px
  "typography.list.body":
    fontFamily: SF Pro, PingFang SC, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 18px
  "typography.list.metadata":
    fontFamily: SF Pro, PingFang SC, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  "typography.caption":
    fontFamily: Inter, PingFang SC, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 18px
rounded:
  "radius.full": 999px
  "radius.16": 16px
  "radius.12": 12px
  "radius.8": 8px
  "radius.4": 4px
spacing:
  "spacing.1": 4px
  "spacing.2": 8px
  "spacing.3": 12px
  "spacing.4": 16px
  "spacing.6": 24px
  "spacing.8": 32px
omitted:
  - section: components
    reason: Component appearance and behavior are governed by versioned YAML contracts rather than duplicated frontmatter tokens.
---

# TopTop Design System

## Overview

TopTop Kit prioritizes decisions in this order: clarity, consistency, then openness. Each interface should make its primary task, current state, next action, and result understandable without explanation. Reuse semantic Tokens, stable components, and established interactions before introducing a new pattern. Adaptation for language, platform, accessibility, and business context must remain controlled and traceable; unsupported needs stay visibly outside the Kit until validated.

This document is the compact entry point for UI generation. The normative source remains the matching contract under `specs/`: foundations define values, components define anatomy and variants, interactions define behavior, and platform mappings define implementation readiness. When this summary and a matching YAML contract differ, follow the YAML contract and report the inconsistency.

The M-Design Feishu PDF set contributes general UI baselines, not TopTop brand colors or component values. The adopted rules, PDF page references, and conflicts with TopTop Kit are recorded in `.agents/skills/toptop-design-system/references/mdesign-baseline.md`. Use the current TopTop business context and semantic Tokens for color decisions.

## Colors

Use semantic roles, never sampled or visually similar literals. The default TopTop accent is `color.brand.primary`; regional TW or KU palettes apply only when the product requirement or an existing page contract explicitly names that region.

Build hierarchy with `color.surface.canvas`, `color.surface.panel`, and the primary, secondary, tertiary, and auxiliary text roles. Reserve state, gift, coin, identity, link, and package colors for their named business meaning. A status must never rely on color alone.

## Themes

The installed DESIGN.md format has no theme-mode field. Frontmatter contains the default Light values; the corresponding Dark values for the included semantic roles are:

| Token | Light | Dark |
|---|---|---|
| `primary` (`color.brand.primary`) | `#16D8C8` | `#14C2B4` |
| `color.brand.primary-a10` | `rgba(22, 216, 200, 0.1)` | `rgba(22, 216, 200, 0.3)` |
| `color.brand.primary-a50` | `#8AECE3` | `#70D8D0` |
| `color.brand.primary-dark` | `#12ADA0` | `#10A095` |
| `color.text.primary` | `#181923` | `rgba(255, 255, 255, 0.9)` |
| `color.text.secondary` | `#8B8C91` | `#8B8C91` |
| `color.text.tertiary` | `#BABABD` | `#8B8C91` |
| `color.text.auxiliary` | `#A3A5B1` | `#A3A5B1` |
| `color.text.white-primary` | `#FFFFFF` | `rgba(255, 255, 255, 0.1)` |
| `color.surface.panel` | `#FFFFFF` | `#181923` |
| `color.surface.canvas` | `#F7F8FA` | `#181923` |
| `color.button.primary` | `#F3F5F9` | `rgba(255, 255, 255, 0.1)` |
| `color.button.secondary` | `rgba(24, 25, 35, 0.04)` | `rgba(255, 255, 255, 0.1)` |
| `color.border.subtle` | `rgba(24, 25, 35, 0.04)` | `rgba(255, 255, 255, 0.04)` |
| `color.border.image` | `rgba(24, 25, 35, 0.1)` | `rgba(255, 255, 255, 0.1)` |
| `color.toast.background` | `rgba(47, 48, 57, 0.9)` | `rgba(47, 48, 57, 0.9)` |
| `color.state.like` | `#FF2E60` | `#FF2E60` |
| `color.switch.track-on` | `#34C759` | `#34C759` |
| `color.switch.track-off` | `#CFCFCF` | `#CFCFCF` |
| `color.search-control.container-background` | `transparent` | `transparent` |
| `color.search-control.field-background` | `rgba(24, 25, 35, 0.04)` | `rgba(255, 255, 255, 0.1)` |
| `color.search-control.placeholder` | `#BABABD` | `#8B8C91` |

Apply theme values through semantic Tokens at the page or provider boundary. Do not create component-local dark-mode branches.

## Typography

Apply complete typography Tokens; do not mix a font size from one role with a weight or line height from another. Use heading roles for page and section structure, body roles for general content, and the dedicated button, input, list, navigation, and caption roles for their named contexts.

Preserve readable hierarchy under long copy, localization, and dynamic content by wrapping or truncating only where the component contract allows it. Do not shrink type to make content fit. Visual truncation must not remove the complete accessible name.

## Layout

Use the spacing scale as a strict rhythm: tighter spacing groups related elements, while larger spacing separates sections and page regions. Preserve safe areas and edge gutters before stretching internal content.

Choose responsive behavior by element:

- Keep spacing, icons, control heights, non-hero avatars, and non-full-width actions fixed.
- Stretch available content width, readable text capacity, full-width actions, and dividers without scaling their typography or thickness.
- Scale backgrounds and large module imagery proportionally while preserving aspect ratio and an explicit focal area.
- Keep dialogs bounded, centered, safe-area aware, and internally scrollable when content exceeds their contract.

For compact and regular widths, retain the same task and information architecture. Larger layouts may reveal an existing child level beside its parent, but must not invent placeholder detail. Foldable layouts use current size class, safe area, and reserved regions; never scale an entire phone canvas or assume a permanent hinge gutter.

## Shapes

Select radius by role and container scale. Use full rounding for pills and circular controls, larger radii for dialogs and sheets, medium radii for module containers and search fields, and smaller radii for compact cards and status labels. Nested containers should read as a hierarchy, with the outer shape no tighter than its inner content.

## Components

Before composing a screen, identify the user task and select the smallest component role that fully matches it. Read the matching `specs/components/<id>.yaml`, every referenced interaction contract, its MDX guidance, platform mapping, and current Kit implementation before coding. A component marked `stable` is contract-stable, not proof that every platform implementation is ready.

### Navigation

- Use `BottomNavigation` for app-level destinations, `PrimaryNavigation` for the highest content sections within a page, and `RegularNavigation` for a titled secondary page or sheet.
- `RegularNavigation` uses the host page's `color.surface.canvas`; never introduce a separate `color.surface.panel` background on the navigation bar. Apply theme or regional surface changes at page-token scope so the bar follows automatically.
- Use one secondary-tab family within a context: Pill for compact categories, Underline for equal peer sections, or Text for lightweight left-aligned switching.
- Back expresses hierarchy; Close dismisses a temporary root surface. Never interchange their semantics.
- `IosStatusBar` belongs only to H5 and iPhone prototype simulation; native production UI uses the system status bar.

### Actions and selection

- Use Button for an immediate command, `SelectorButton` for radio or checkbox selection, and `Switch` for an immediately applied boolean setting.
- Keep the primary action visually dominant and describe actions with explicit verbs.
- Preserve default, pressed, disabled, focus, loading, success, and failure states whenever the task can enter them.

### Input, lists, and messaging

- `SearchControl` is only for search activation, editing, clearing, cancellation, and submission; it is not a generic text field or filter control.
- `ChatInput`, `ChatEmojiGifPanel`, and `ChatEmojiGifTabBar` form the private-message composer. They do not own the message-list scroll container.
- `RegularListItem` represents an action row or message row. The row body and an independent trailing action are separate focus and activation targets.
- Use `AvatarVisual` for identity imagery and `ListTag` only for the defined identity or membership metadata.
- Use `EmptyState` for a resolved empty region and `ImageEmptyState` for a missing or failed image. Loading, permission failure, partial failure, and empty results are different states.
- `ChatBubble` provides the message shell and message states; gesture menus, reply interactions, and host lifecycle remain governed by their interaction contract.

### Overlays and feedback

- Use `CenterDialog` for a short important decision, `ActionPanelSheet` for a short action set, and a content sheet or full page for forms and multi-step work.
- A root sheet closes; a nested sheet goes back one level. Unsaved work requires confirmation without discarding the current input.
- Use `Toast` only for transient, non-critical feedback. Use persistent status, recovery UI, an empty or error state, or a dialog when the user must decide or recover.
- `PublishStatusNotification` is scoped to feed publishing, while `InRoomNotification` is scoped to transient voice-room events.

### Interaction and accessibility

Use `motion.duration.instant`, `motion.duration.standard`, `motion.duration.emphasized`, `motion.easing.standard`, and `motion.spring.standard` according to the matching interaction contract. Update results immediately; motion explains state and spatial relationships but never delays task completion. Keep overlays mounted until their exit transition finishes. Under reduced motion, remove positional and scaling movement and retain only brief opacity feedback when useful.

Prefer native semantic controls. Every action needs an accessible name, visible focus, and keyboard behavior equivalent to pointer behavior. Overlays constrain focus while open and restore it on close. Selection, failure, unread, and progress states need text or semantic state in addition to color. Preserve complete accessible content when visual text is truncated.

Semantic monochrome icons use registered assets, `currentColor`, and a Kit icon wrapper; business-color assets retain their intended color. Animated PAG assets require a static fallback, offscreen pause, and reduced-motion behavior. Avatars, photos, covers, and backgrounds are content assets, not icons.

## Do's and Don'ts

- Do start from the primary user task, map it to stable Kit roles, and list required states before drawing or coding.
- Do use `specs/foundations/`, `specs/components/`, `specs/interactions/`, and `specs/platform-mappings/` as the exact source for values, behavior, and platform readiness.
- Do use Hybrid Prototype when the Kit cannot express a validated concept: keep stable Kit anchors, use basic layout and content primitives, and label unsupported business structures as Prototype modules.
- Do classify each unsupported need as a page, component, interaction, Token, content, or platform-capability gap; treat a production gap as a blocker.
- Do verify long copy, dynamic content, keyboard and focus behavior, reduced motion, Light and Dark themes, narrow screens, wide screens, safe areas, and interrupted transitions.
- Don't recreate an existing component from visual similarity, broaden it with undocumented props, or present a `review` contract as fully stable.
- Don't treat Studio experiments, Core page-specific modules, or representative prototypes as new Kit contracts.
- Don't hard-code sampled colors, arbitrary spacing, mixed typography values, component-local dark branches, or SVG fill and stroke values.
- Don't use clickable non-semantic containers, remove focus styles, rely only on color, or expose an unlabeled icon button.
- Don't use decorative motion, animate layout when transform or opacity can express the same transition, or remove an overlay before exit completes.
- Don't promote a Prototype pattern into the Kit until repeated real scenarios, contract boundaries, interaction behavior, documentation, previews, and tests are all validated.
