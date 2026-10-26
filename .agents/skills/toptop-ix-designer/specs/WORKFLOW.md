# 设计交付与验证路径

本文描述当前真实可用的工作流。推理与改码在本地 Cursor 等 Agent IDE 完成，Portal 提供只读 Kit、原型预览和验收说明。

## 能力现状

| 能力 | 入口 | 当前状态 |
|------|------|----------|
| **Kit 浏览** | Portal `/principles`、`/foundations`、`/components`、`/interactions` | 可用 |
| **结构化契约** | `GET /api/catalog` | 可用 |
| **原型预览** (`/canvas`) | 已搭建原型路由的集中预览与调参 | 可用 |
| **原型运行时** | `/prototype-runtime/app/<screen>` | 可用 |
| **综合验收说明** | Portal `/audit` | 可用 |
| **视觉走查工作台** | Portal `/audit/visual` | 可用，仅作局部视觉检查 |
| **实机审计** | `npm run ui` + Lookin | 需本地设备 |
| **Design MVP Manifest** | `src/lib/design-mvp-bundle.ts` 等库 | 逻辑保留、单测在跑，**当前无页面入口** |

> `/canvas` 曾经是「自然语言 → PageCanvasPlan → 组件预览」的生成画布。该形态及 `page-canvas-showcase.tsx` 已被 Core 目录与 Studio 项目画廊取代；Manifest 相关库仍可由 Agent 直接调用，但当前没有 Portal 页面入口。

## 综合验收（不要单一路径）

完整 UI 交付应组合下列能力，按页面区域选用；任一层通过都不等于整页通过。

| 路径 | 回答的问题 | 典型入口 |
|------|------------|----------|
| **原则与体验** | 任务是否清晰、是否符合 Kit 价值观 | Portal `/principles`、Cursor `toptop-design-review` |
| **Kit 组件** | 标准件尺寸、间距、状态是否达标 | Lookin UI Audit + Profile |
| **局部结构/像素** | 业务区块与 Figma Frame 是否一致 | Lookin「通用节点审计」+ Frame URL、`generic-rules.yaml` |
| **局部视觉** | 关键区域还原度 | Portal `/audit/visual`、`verify:screenshot` |

整页像素对比不作为自动门禁：截图受设备、字体、图片内容和动态数据影响，只能作为人工判断的辅助证据。

---

## 一、快速门禁（无需浏览器）

```bash
npm install
chmod +x scripts/verify-design-mvp.sh
npm run verify:mvp
```

通过即表示：YAML 契约合法，页面画布解析、Manifest 导出与 Yueban layers 相关单测通过。

可选（需 Python 依赖）：

```bash
pip install -r requirements-verify.txt
npm run verify:mvp -- --with-screenshot
```

在 `samples/design-mvp/` 放置 `reference-375.png` 与 `actual-375.png` 后，会跑像素对比 JSON。

---

## 二、主链路：需求 → 原型 → 审查

### 1. 对齐 Kit

```bash
npm run portal:dev
```

先读 `PROJECT.md`、`specs/principles/core-design-principles.yaml`，再按任务读取相关 `specs/foundations/*.yaml`、`specs/components/<id>.yaml` 和 `content/components/<id>.mdx`。不要把整个仓库灌入上下文。

### 2. 在本地 Agent 中搭建

使用 `toptop-prototype-studio`（Kit 不完整时）或 `toptop-design-system`（严格落地）。实现前先输出：

- 主要任务与页面区域蓝图
- 需要覆盖的状态清单
- 组件映射与分类后的 Kit gaps
- 每个可见层的来源标记：`kit` / `primitive` / `prototype`

若需要新设计，先将问题标为 `pageGap`、`componentGap`、`interactionGap`、`tokenGap`、`contentGap` 或 `capabilityGap`，并为 `prototype` 区域写清用户任务、触发与结果、输入与信息优先级、状态、行为边界、系统约束和探索边界。已有组件能通过合理组合完成任务时不算 gap。

AI 可以自由探索信息组织、操作模型和反馈方式，但颜色、字体、圆角、图标、基础动效与稳定 Kit 内部结构继续受 Foundations 和组件契约约束。

### 3. 在 Portal 预览

打开 [http://localhost:3000/canvas](http://localhost:3000/canvas)。

左侧按一级页面与二级页面列出已登记的原型路由；右侧为可交互预览，支持：

- Light / Dark 主题（全局设置，切换后保留当前路由）
- 五种设备尺寸：375×812、393×852、430×932、Duo 外屏 466×678、Duo 内屏 890×626（按页面独立保存）
- 70%–110% 缩放（按页面独立保存）
- 刷新与重置
- 「单独打开」跳转到 `/prototype-runtime/app/<screen>?theme=&width=&height=`

底部面板显示该页面的 Kit 锚点、Prototype 模块和页面说明。

新页面在本地代码库完成后，需要登记到 `apps/design-system-portal/src/components/prototype-preview-showcase.tsx` 的 `prototypes` 列表才会出现在预览目录中。

### 4. Skills 审查

在 Cursor 中调用 `toptop-design-review`，提供用户目标、实现文件、运行截图和组件栈。需要深查时再追加：

- `monkren-design/skills/04-review/5-dim-review`
- `ai-slop-check`、`hierarchy-rhythm-review`
- `interaction-states-pass`
- `accessibility-audit`

审查为只读，输出带 spec 或 `file:line` 证据的 P0/P1/P2 与是否可交付。若 Manifest 中存在 Kit candidate，还必须给出 `keep-prototype`、`nominate` 或 `reject`；页面看起来合理不能单独作为提名依据。

### 5. 可选：局部视觉核对

打开 Portal `/audit/visual`，上传设计稿与实现截图，在浏览器本地完成标注、平铺与透明叠加，并导出 PNG / Markdown / JSON。图片不会上传服务端。

命令行路径：

```bash
pip install -r requirements-verify.txt
npm run verify:screenshot -- path/to/reference.png out/actual.png
```

关注 JSON 中 `changed_pixel_ratio` 与 `same_size`。组件化路径不要求像素零差异。

### 6. 可选：候选能力反哺 Kit

只有同时满足以下条件才进入 Kit：

- 现有 Kit 组合无法在不扭曲语义的前提下完成任务；
- 用户任务、组件或模式边界、Variants、状态与异常路径稳定；
- 已在目标视口、主流程和可访问性场景验证；
- 有两个稳定复用场景，或属于经产品 / Kit owner 确认的平台级基础能力；
- `toptop-design-review` 结论为 `nominate`，且当前任务授权修改 Kit；
- 无未决产品、内容、能力或工程 blocker。

`componentGap`、`interactionGap`、`tokenGap` 分别进入组件、交互或 Foundations，不得一律包装成组件。落地从 `draft` 开始，补齐 YAML、MDX、Token、Interaction、实现、测试和参考预览；验证通过且无 blocker 后才按 `draft → review → stable` 晋升。页面专属业务模块默认继续保留为 Prototype。

---

## 三、实机 / Figma 审计

与主链路并行，不替代 Lookin：

```bash
npm run ui
# http://localhost:4317 — Figma JSON + Lookin JSON 对比
npm run audit -- --figma-json samples/figma-page.json --ui-json samples/lookin-page.json --out out
```

Portal `/audit` 查看规则覆盖与服务状态；实机连接后做组件 Profile 比较。

---

## 四、推荐顺序（一次完整试跑）

```text
specs:validate
    → 读取 Kit 契约与指南
    → Cursor 输出蓝图与状态清单
    → Cursor 实现原型并登记预览
    → /canvas 逐状态与 375 / 466 / 890 检查
    → 截图优先的独立视觉审查
    → 修正后再次截图
    → toptop-design-review 交付门禁
    → （候选）keep-prototype / nominate / reject
    → （已授权且 nominate）draft → Kit 实现与验证 → review → stable
    → （可选）/audit/visual 局部叠图
    → （可选）Lookin + Figma audit
```

---

## 五、已知边界

- Portal 只读，不托管模型，也不在页面内执行审查；规范变更走 YAML/MDX 与 Git。
- Manifest 生成能力目前只有库和单测，没有页面入口。
- 原型使用本地内置数据，不连接真实业务接口、账号和权限。
- 整页像素对比不构成验收结论，需要人工确认。
- 实机验收依赖本地设备与 `npm run ui`，不阻塞 Kit 与原型主链路。
