# Internal Lookin Fork

This repo includes an internal Lookin fork at `vendor/Lookin`.

The fork keeps Lookin's native macOS UI and adds:

- A `UI Audit` toolbar button and native audit panel.
- `Export UI Audit JSON...` for the selected subtree.
- `Open UI Audit Panel...` in the File menu.

## Workflow

1. Build and open the modified Lookin client:

   ```bash
   npm run lookin:build
   npm run lookin:open
   ```

   Opening the app once registers the local `lookin-audit://` protocol.
2. Start the local audit service from the repository root:

   ```bash
   FIGMA_TOKEN=... npm run ui
   ```

3. Start the Kit Portal in another terminal:

   ```bash
   npm run portal:dev
   ```

4. Open `http://localhost:3000/audit`. After the service is online, click
   `打开 Lookin` and approve the browser prompt. If Lookin already has a static
   workspace, the link opens the UI Audit panel; otherwise it brings the
   connection window to the front.
5. Connect an iPhone running a TopTop Debug/QA build with `LookinServer`.
6. Use Lookin normally: choose the app, reload hierarchy, and select the exact
   module/container to validate.
7. Click the `UI Audit` toolbar button if the panel is not already open.
8. Leave the Figma field empty for the default Kit audit. Lookin identifies the
   selected component from its iOS class or accessibility identifier, then the
   service reads the Profile and `reference.figmaUrl` from YAML.
9. Click `按 Kit 规范验收`. The panel waits for pending Lookin hierarchy
   details, then posts the selected subtree and group screenshot to localhost.
10. 点击列表项在实机截图上定位问题。需要留档时点 **一键导出问题**（导出本次全部 Kit 问题）；若只导出复核过的项，先勾选再点 **导出已勾选**。
11. 导出会生成飞书可导入 CSV 和 per-issue SVG 证据，位于 `out/sessions/<session-id>/`，并自动在 Finder 中打开。

Switching Lookin containers clears the old result but does not start another
comparison. `File -> Export UI Audit JSON...` remains available for diagnostics.
Every time the UI Audit panel opens, it reloads component Profiles from
`127.0.0.1:4317`, so YAML Kit rule changes take effect without rebuilding
Lookin.

For a business-specific instance comparison, paste a Figma Frame URL before
starting the audit. Unknown modules that cannot be mapped to a Kit Profile also
require either an explicit Profile selection or a Figma URL. Generic node audit
always requires a Figma URL.

## Build Requirements

The upstream Lookin project uses CocoaPods:

```bash
cd vendor/Lookin
pod install
xcodebuild -workspace Lookin.xcworkspace -scheme LookinClient -configuration Debug CODE_SIGNING_ALLOWED=NO build
```

Or run the repository helper:

```bash
npm run lookin:build
npm run lookin:open
npm run lookin:test
```

The helper uses `.build/lookin` as the deterministic Xcode Derived Data
directory. If the Portal reports that Lookin did not open, run
`npm run lookin:open` once and retry the link.

## Changed Files

- `vendor/Lookin/LookinClient/Manager/LKAppMenuManager.m`
- `vendor/Lookin/LookinClient/Static/LKStaticWindowController.m`
- `vendor/Lookin/LookinClient/Static/LKUIAuditSerializer.{h,m}`
- `vendor/Lookin/LookinClient/Static/LKUIAuditWindowController.{h,m}`
- `vendor/Lookin/LookinClient/Toolbar/LKWindowToolbarHelper.{h,m}`

## Notes

Lookin is GPL v3. This is intended for internal use only. If the modified app is distributed externally, review GPL obligations before shipping.
