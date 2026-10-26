# Business profile authoring

Create `<business>-profile/profile.yaml` against `specs/business-profile.schema.yaml`.

## Minimum profile

```yaml
schemaVersion: 1
id: example-product
name: Example Product
designSystem:
  discoveryOrder:
    - page
    - module
    - component
    - pattern
    - token
  sources:
    components:
      kind: api
      location: https://design.example.com/api/components
    tokens:
      kind: repository
      location: packages/tokens
outputs:
  draftRoot: .design/ix
  approvedRoot: specs/features
prototype:
  mode: project-native
  allowProductionCode: false
```

## Rules

- Use portable, repository-relative paths or authenticated URLs; never personal absolute paths.
- Put business vocabulary and design rules in the profile, not Core.
- Prefer structured design-system sources. Human guidance may supplement but not contradict contracts.
- Declare missing design-system categories instead of providing fictional defaults.
- Provide at least one validation method when runnable prototypes are allowed.
- Keep secrets and credentials outside the profile.

## Adoption test

Given one representative PRD, confirm that Core plus the new profile can:

1. discover existing product capabilities;
2. map proposed UI to real components and Tokens;
3. identify unsupported regions as gaps;
4. generate a prototype in the target project;
5. cite every reused design-system source;
6. run the profile's validation checks.
