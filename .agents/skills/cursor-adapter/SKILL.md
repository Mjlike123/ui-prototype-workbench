---
name: cursor-adapter
description: Maps ix-designer-core capabilities to Cursor repository, search, terminal, web, image, MCP, browser-verification, question, and subagent tools. Use as the Agent adapter when an IX workflow runs inside Cursor.
disable-model-invocation: true
---

# Cursor adapter

Load `adapter.yaml` and expose only capabilities currently available in the session.

## Mapping rules

- Read and search through Cursor file tools; keep paths repository-relative in deliverables.
- Use specialized tools before terminal commands.
- Discover MCP schemas before invoking external providers.
- Load provider-specific Skills before using Figma, Lark, or other governed services.
- Treat authentication, authorization, and user confirmation as runtime gates, not implied capability.
- Use browser/runtime inspection to validate prototypes when available.
- Use focused subagents only for broad independent exploration or review.
- Never let a tool limitation change the business design contract silently.

## Degradation

If a configured provider is unavailable:

1. mark the capability `fallback` or `unavailable`;
2. follow Core fallback instructions;
3. preserve the missing verification in the handoff;
4. do not fabricate provider output.

This adapter contains no TopTop component, Token, prototype, or output rules.
