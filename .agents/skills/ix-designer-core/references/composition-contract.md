# Composition contract

An IX Designer runtime is:

```text
ix-designer-core + one business profile + one agent adapter + user request
```

## Resolution order

1. User instructions and authorization.
2. Business profile policies and design-system contracts.
3. IX Designer Core workflow.
4. Agent adapter implementation details.

An adapter cannot change product or design rules. A profile cannot redefine the Core output semantics. User authorization cannot be inferred from available tools.

## Runtime context

Resolve this object before design work:

```yaml
coreVersion: 1
profile:
  id: example-product
  path: .agents/skills/example-profile/profile.yaml
adapter:
  id: cursor
  path: .agents/skills/cursor-adapter/adapter.yaml
capabilities:
  document.read: available
  designSystem.query: available
  repository.search: available
  prototype.render: available
  runtime.inspect: available
outputs:
  draftRoot: .design/ix
  approvedRoot: specs/features
```

Capability states are `available`, `fallback`, `unavailable`, or `forbidden`.

## Design-system query contract

The profile must expose any supported sources:

- principles;
- Foundations and semantic Tokens;
- components and variants;
- interaction patterns;
- full-page templates and shared modules;
- content guidance and examples;
- historical research and approved feature specs.

The adapter supplies `designSystem.query` through local files, an API, MCP, or another indexed source. Results must preserve source IDs or URLs.

## Gap contract

Use one of:

- `pageGap`
- `componentGap`
- `interactionGap`
- `tokenGap`
- `contentGap`
- `capabilityGap`

Each gap records the unmet user need, evidence searched, temporary prototype treatment, and validation required. Never create a fake design-system identifier.

## Porting to another business

Do not edit Core. Create a new profile that:

1. names the product and platforms;
2. maps design-system sources;
3. defines product terminology;
4. defines prototype and production-code permissions;
5. defines output locations and review gates;
6. supplies validation commands or services.

If the target Agent platform differs, add or select an adapter independently.
