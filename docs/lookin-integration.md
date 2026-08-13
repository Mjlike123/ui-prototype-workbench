# Lookin Integration Notes

Lookin is usable as the runtime UI collection layer, but the shipped macOS app is optimized for interactive inspection rather than headless export.

## What Lookin Provides

- Runtime hierarchy from an iOS app that integrates `LookinServer`.
- View and layer frames, class names, properties, visibility, text, colors, constraints, and screenshots.
- A client/server protocol between the macOS client and the iOS app, historically backed by `KKConnector`.

## MVP Strategy

The MVP consumes a normalized `UiSnapshot` JSON file:

```json
{
  "pageName": "TopTop Detail",
  "device": { "width": 390, "height": 844, "scale": 3 },
  "root": {
    "id": "root",
    "type": "UIWindow",
    "frame": { "x": 0, "y": 0, "width": 390, "height": 844 },
    "children": []
  }
}
```

This keeps the audit engine independent from the collector. A production collector can be added later without changing matching, diffing, annotation, or reporting.

## Implemented Bridge

This project includes a native bridge at `collectors/lookin-collector/main.m`.

Build it with:

```bash
npm run collector:build
```

The compiled binary is written to `bin/lookin-collector` and dynamically links:

```text
/Applications/Lookin.app/Contents/Frameworks/LookinShared.framework
```

The bridge:

- Discovers USB devices through `Lookin_PTUSBHub`.
- Tries Lookin USB ports `47175-47179`.
- Can also try simulator ports `47164-47169`.
- Sends Lookin request types `Ping`, `App`, and `Hierarchy`.
- Decodes `LookinConnectionResponseAttachment` via `NSKeyedUnarchiver`.
- Converts `LookinHierarchyInfo.displayItems` into the tool's `UiSnapshot` JSON.

The web UI calls it through `/api/connect-phone`.

## Remaining Production Options

1. Keep improving the native bridge in this repo.
2. Fork Lookin macOS and add a richer `Export JSON` command after a refresh.
3. Add an internal TopTop debug endpoint that exports the active view hierarchy in the same JSON shape.

## Visual UI Hook

The local web UI already calls a collector abstraction through `LookinJsonCollector`.

The next production collector should implement the same shape:

```ts
type LookinCollector = {
  collectCurrentPage(): Promise<UiSnapshot>;
};
```

The UI now includes a `连接手机` button:

1. Discover connected iOS devices.
2. Find the running TopTop app with `LookinServer`.
3. Request the current hierarchy and screenshots.
4. Convert Lookin models into `UiSnapshot`.
5. Run the same audit engine and keep the `导出问题` button unchanged.

The first bridge version captures hierarchy, frames, visibility, class names, and best-effort text. Screenshot extraction and richer color/font parsing can be added without changing the web UI or diff engine.

## Release Safety

`LookinServer` must be limited to Debug or internal QA configurations. It must never be linked into App Store or production Release builds.
