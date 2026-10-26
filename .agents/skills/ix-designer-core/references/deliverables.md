# Portable deliverables

## UX design document

Include:

- goal, users, scope, and source confidence;
- information architecture and primary/secondary flows;
- page and overlay behavior;
- state, failure, permission, and recovery rules;
- design-system mapping with source evidence;
- UX improvements and decisions requiring confirmation;
- executable acceptance criteria.

## Interaction specification

The machine-readable spec must:

- use stable page, element, overlay, and transition IDs;
- define a terminal condition or outgoing transition for every state;
- define dismiss behavior for every overlay;
- keep business rules traceable to sources;
- distinguish design-system assets from prototype gaps.

## Functional prototype

When authorized and supported:

- use the target project's framework and routing;
- call real design-system components and semantic Tokens;
- preserve component and pattern internals;
- implement the primary flow and applicable edge states;
- support keyboard, focus, accessible names, localization, and reduced motion;
- verify rendered bounds, computed Tokens, transitions, and recovery behavior.

The business profile decides whether the prototype stays experimental or may enter production code.
