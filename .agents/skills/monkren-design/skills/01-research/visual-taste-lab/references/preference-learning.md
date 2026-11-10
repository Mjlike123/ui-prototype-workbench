# Preference Learning

Use this loop to turn repeated user corrections into a durable taste profile without overfitting one project.

## Evidence hierarchy

From strongest to weakest:

1. The user explicitly states a general preference.
2. The same correction appears in at least two independent pages or projects.
3. The user repeatedly accepts one direction and rejects the same alternative.
4. A single accepted implementation suggests a tentative preference only.

Repository conventions, accessibility requirements, platform rules, and component contracts are **not taste preferences**. Keep them as guardrails.

## Confidence

- `stable`: explicit general preference, or repeated evidence across at least two independent contexts with no contradiction.
- `emerging`: one explicit project correction plus supporting behavior, or repeated evidence within one project.
- `tentative`: one observation or inferred acceptance.
- `retired`: later feedback contradicts the preference or limits its scope.

Do not silently promote `tentative` to `stable`.

## Storage

When the current environment exposes a personal Agent Store, use:

```text
design-taste/preferences.yaml
```

Resolve the store path from session context; never guess or use an unavailable store. Keep the reusable Skill generic and the user-specific profile personal. Do not commit the personal profile into a project repository.

Suggested structure:

```yaml
schemaVersion: 1
updatedAt: YYYY-MM-DD
preferences:
  - id: immersive-media-chrome
    statement: Extend strong media behind system chrome while keeping text safe.
    scope: mobile-product-ui
    confidence: stable
    evidence:
      observations: 2
      contexts: [profile-hero, login-hero]
    applyWhen:
      - A page starts with a strong cover, hero image, or video.
    do:
      - Overlay transparent system chrome on media.
      - Preserve safe insets for text and controls.
    avoid:
      - A separate status-bar color strip above the hero.
    exceptions:
      - Form and document pages without media keep a normal safe-area surface.
```

Use generic context labels. Do not store raw screenshots, confidential project names, customer names, unreleased features, internal metrics, transcript text, or credentials.

## Update loop

After a user reviews a design:

1. Extract the correction and the reason implied by it.
2. Check whether it is a platform rule, project constraint, or taste preference.
3. Search the current profile for the same semantic preference.
4. Add one observation and a generic context label, or create a `tentative` entry.
5. Promote or narrow confidence only when the evidence rules above are met.
6. Record contradictions under `exceptions` or set the preference to `retired`.

## Application

Before proposing a visual direction:

1. Load only profile entries relevant to the current product type and viewport.
2. List the applied preference IDs in the design-language document.
3. Explain any preference intentionally not applied because of brand, platform, accessibility, or task constraints.
4. Treat preferences as priors, not immutable rules. Current explicit user direction always wins.

## User-facing summary

When meaningful preferences changed, report:

- new or updated preferences;
- confidence and evidence count;
- what remains tentative;
- where the personal profile is stored.

Do not repeat raw conversation excerpts.
