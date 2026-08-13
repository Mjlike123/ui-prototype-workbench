# TopTop UI 原型工作台

> 仓库名：`ui-prototype-workbench`（原 `ui-audit-tool`）

Kit 定义边界，本地 Agent 搭建功能原型，Skills 负责视觉、设计和交互验收，H5 与 iOS 运行时审计完成后续闭环。

完整项目边界、L1/L2/L3 架构和工作流见 [PROJECT.md](PROJECT.md)。

MVP CLI for checking iOS UI fidelity against a Figma frame and producing a Feishu/Lark-friendly issue report.

The first version is intentionally scoped to one manually opened page:

1. Open the target TopTop page on a connected iPhone.
2. Export or provide a normalized Lookin UI snapshot JSON.
3. Provide a Figma frame JSON, or a Figma URL with `FIGMA_TOKEN`.
4. Run the audit.
5. Import `out/lark-report.csv` into Feishu Sheets and attach/use the generated SVG annotations.

## TopTop Design System Portal

The same repository now includes a standalone internal Next.js portal under
`apps/design-system-portal`. It presents the shared visual foundations,
component contracts, React reference previews, interaction patterns,
platform mappings, and Lookin audit coverage.

```bash
npm run portal:dev
```

Open `http://localhost:3000`. The portal remains useful without the audit
service; run `npm run ui` in a second terminal to show live profile status in
the audit center.

外网协作模式下，Portal 只提供 Kit、预览、Catalog API 和 Skill 使用方式；推理与代码修改运行在用户本机 Cursor。入门页：`/getting-started`。

部署边界与门禁见 [docs/portal-deploy.md](docs/portal-deploy.md)。

### Agent Kit

```bash
npm run skill:sync-specs
npm run skill:check
npm run check:kit
```

- `toptop-design-bundle`：统一入口与 Skill 路由
- `toptop-prototype-studio`：Kit 不完整时使用基础原语和创意模块搭建混合原型
- `toptop-design-system`：使用较完整 Kit 严格实现页面
- `toptop-design-review`：只读检查视觉、规范和交互逻辑

### 原型预览与验证

搭建 → 预览 → 审查的最小路径：

```bash
npm run portal:dev   # http://localhost:3000/canvas 原型预览目录
npm run verify:mvp   # 契约 + 单测门禁
```

`/canvas` 集中预览本地 Agent 已搭建的可运行原型路由，支持主题、设备尺寸与缩放；新页面需登记到预览目录后才会出现。

整页截图的本地视觉走查入口：`http://localhost:3000/audit/visual`。该工作台提供标注、平铺、透明叠加与 PNG / Markdown / JSON 导出；基础像素结果不作为自动验收门禁。

说明与逐步验证：[docs/design-mvp-verification.md](docs/design-mvp-verification.md)

Before publishing spec changes:

```bash
npm run specs:validate
npm run portal:test
npm run portal:build
```

Figma synchronization only writes generated cache and never overwrites
hand-authored YAML or MDX:

```bash
npm run figma:sync -- --dry-run
```

## Run The Sample

```bash
npm install
npm run audit -- --figma-json samples/figma-page.json --ui-json samples/lookin-page.json --out out
```

Outputs:

- `out/lark-report.csv`: one issue per row.
- `out/UI-001.svg`, `out/UI-002.svg`, ...: issue annotations.
- `out/summary.json`: machine-readable run summary.

## Open The Visual UI

```bash
npm run collector:build
npm run ui
```

Then open `http://localhost:4317`.

The UI provides:

- A Lookin-like hierarchy panel on the left.
- A phone canvas in the center with runtime UI frames and issue overlays.
- An issue list on the right.
- A `连接手机` button that calls the native Lookin collector.
- A `比较选中模块` button that checks only the selected UI container.
- A `导出问题` button that writes the current module's issues to `out/lark-report.csv` and SVG annotations.

For now, the UI loads normalized JSON files. By default:

- Figma JSON: `samples/figma-page.json`
- Lookin JSON: `samples/lookin-page.json`

Replace the input paths in the top bar when you have real exports.

## Connect A Phone Through LookinServer

Before using `连接手机`:

1. Install `Lookin.app` in `/Applications`.
2. Build the native bridge:

   ```bash
   npm run collector:build
   ```

3. Run a TopTop Debug/QA build that integrates `LookinServer`.
4. Connect the iPhone through USB and keep the target page open.
5. Start the visual UI:

   ```bash
   npm run ui
   ```

6. Open `http://localhost:4317` and click `连接手机`.

Optional fields:

- `Bundle ID`: limits collection to a specific app, for example `com.taptap.toptop`.
- `设备`: choose `真机 USB`, `模拟器`, or `自动`.

On success, the collector writes `captured/current-lookin.json` and refreshes the canvas.

Recommended review flow:

1. Click a UI container in the hierarchy tree or phone canvas.
2. Click `比较选中模块`.
3. Review only that module's issues.
4. Click `导出问题` to export the current module's issue sheet.

If connection fails, confirm:

- The TopTop build includes `LookinServer` and is not a Release/App Store build.
- The app is foregrounded and not paused at a breakpoint.
- The phone is trusted by this Mac.
- No other Lookin client is occupying the same app connection.

## Use Lookin's Native UI

For internal use, this repo also includes a modified Lookin client under `vendor/Lookin`.

It adds:

- A native `UI Audit` toolbar button and panel.
- Current selected-container and Figma Frame mapping.
- On-demand comparison; selecting a container never starts a full-page audit.
- Issue confirmation, reverse navigation to the Lookin node, and Feishu CSV export.
- `File -> Export UI Audit JSON...` as a selected-subtree diagnostic export.

Start the local service before opening the panel:

```bash
npm run lookin:build
npm run lookin:open
FIGMA_TOKEN=... npm run ui
npm run portal:dev
```

Open `http://localhost:3000/audit` and click `打开 Lookin`, then select a
container in Lookin, open `UI Audit`, and click `按 Kit 规范验收`. The default
flow identifies the iOS component and reads its Figma reference from the YAML
Profile, so no URL needs to be pasted. Paste a Figma Frame URL only for a
business-specific instance or generic-node comparison. Only checked/confirmed
issues are exported. Reopening the panel reloads the latest component Profiles
from the local Kit service.

### Component-driven audit

For known design-system components, choose `自动识别（推荐）` or explicitly
select `二级 Tab`. The audit service then uses the versioned profile in
`specs/components/secondary-tab.yaml` instead of reporting every internal
Figma Frame and iOS wrapper View.

The secondary Tab profile only checks:

- Container and button width/height.
- Text-to-background left/right padding.
- Gaps between adjacent tabs.
- Selected and unselected text/background colors.

Results are grouped by rule, so one rule produces at most one issue even when
several tabs are affected. `需确认` and `原始节点差异` are hidden by default and
can be enabled from the panel when diagnosing a component mapping.

See `docs/component-audit-spec.md` when adding another component standard.

See `docs/lookin-fork.md` for the build and usage details.

## Use Figma Directly

```bash
FIGMA_TOKEN=... npm run audit -- \
  --figma-url "https://www.figma.com/file/FILE_KEY/name?node-id=1-2" \
  --ui-json samples/lookin-page.json \
  --out out
```

The native panel reads the token only through the local service. As an
alternative to the environment variable, store it outside the repository:

```json
{ "figmaToken": "your-personal-access-token" }
```

## Feishu Sheet Columns

The CSV is shaped for a QA issue sheet:

- 页面
- 问题编号
- 问题截图
- 问题类型
- 问题描述
- 建议修复
- 设计值
- 实际值
- 偏差
- 匹配置信度
- Figma 节点 ID
- Lookin 节点 ID
- 设计版本
- 严重程度
- 状态
- 负责人

## Data Contracts

Runtime UI snapshots use `UiSnapshot` from `src/types.ts`. Figma data uses `FigmaDesign` from the same file.

Important fields:

- `localFrame`, `frame` / `frameToRoot`: local and absolute iOS point coordinates.
- `lookinOid` and `classChain`: stable Lookin identity and runtime class context.
- `text`: used for high-confidence matching.
- `accessibilityIdentifier`: recommended for critical controls.
- `color`, `backgroundColor`, font fields, `cornerRadius`, `safeArea`: style inputs.
- `screenshotData`: selected-container group screenshot used as evidence.

## Lookin Integration

See `docs/lookin-integration.md`.

The current CLI consumes normalized JSON through `LookinJsonCollector`. Production should replace that collector with either:

- a Lookin fork that exports JSON after refresh, or
- a headless collector that reuses the Lookin/LookinServer protocol.

## Checks Covered

- Size differences.
- Horizontal and vertical spacing differences.
- Edge, center and text-baseline alignment differences.
- Text mismatches.
- Font size/weight/line-height, color and corner-radius differences.
- Image size differences.
- Missing design nodes.
- Extra runtime nodes.

Thresholds can be tuned with:

```bash
npm run audit -- \
  --figma-json samples/figma-page.json \
  --ui-json samples/lookin-page.json \
  --out out \
  --size-pt 3 \
  --spacing-pt 4 \
  --alignment-pt 3
```
