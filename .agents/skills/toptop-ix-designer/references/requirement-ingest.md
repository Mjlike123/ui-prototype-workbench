# 多模态需求摄入

将任意输入归一为 `RequirementBrief`（`specs/requirement-brief.schema.yaml`）。多源时合并并标注冲突。

## 通用原则

1. **先读附件，再提问** — 遵循 `discovery-questions` Phase 1。
2. **每条事实带 `source` 与 `confidence`**：`high`（明文规则）、`medium`（推断）、`low`（仅视觉猜测）。
3. **冲突不自行裁决** — 写入 `conflicts` 与 `openQuestions`。
4. **不编造** — 文档与图中未出现的内容标为假设或待确认。
5. **先分层再建模** — 产品功能、存量说明、视觉方向、运营约束、技术约束不得混成一类需求。
6. **过滤不等于删除** — 不进入设计的内容仍写入 `ignoredItems`，保留来源和原因。

## 信息过滤与设计影响转译

每个输入源抽取后，统一归类：

| 类别 | 判断标准 | 输出 |
|------|----------|------|
| 新增功能 | 本期新增用户任务、入口、规则或状态 | `scope.newBehavior` |
| 已有功能变化 | 存量能力发生行为、权限、状态或文案变化 | `scope.existingModified` |
| 已有功能未变 | 仅为上下文，现有 Kit / Core / 代码已有证据 | `scope.existingUnchanged` |
| 视觉方向 | 色彩、图标、字体、间距、动效和视觉示意 | `visualDirections` |
| 设计影响 | 产品、运营或技术说明影响用户体验 | `designImpacts` |
| 无设计影响 | 用户无感的内部实现、排期或执行信息 | `ignoredItems` |

### 存量能力核验

```text
PRD 提及能力
  → 搜索 specs/components 与 specs/interactions
  → 搜索相关 Core 原型和现有代码
  → 标记 new / existing-modified / existing-unchanged / uncertain
```

无法确认时标 `uncertain` 并进入 `openQuestions`，不得凭名称认定为已有功能。

### 技术、运营、视觉信息

- 技术说明影响加载、失败、权限、兼容、性能感知时，转成 interaction 约束。
- 运营说明影响入口曝光、内容层级、活动标签、审核状态或地区策略时，转成 interaction 或 visual 约束。
- 视觉说明与功能行为拆开记录；可以约束 UI，但不能反向推导文档未定义的新功能。
- 只有确认无用户感知时，才能放入 `ignoredItems`。

每条影响建议记录：

```yaml
designImpacts:
  - sourceType: technical
    sourceRef: PRD §4.2
    statement: 接口可能延迟返回
    impact: 补充 loading 与 retry 状态
    target: interaction
    confidence: high
```

## Adapter：飞书文档

**触发**：用户提供 `feishu.com` / `larksuite.com` / `doubao.com/docx` URL 或 doc token。

**步骤**：

1. 读取 `lark-doc` Skill 与 `lark-shared` 前置条件。
2. `lark-cli docs +fetch --doc "<url>"`（默认 simple；需 block 定位时用 with-ids）。
3. 提取：标题层级、正文、表格、列表、嵌入画板/表格 token（按需下钻 `lark-sheets` / `lark-base`）。
4. 文档内图片：`docs +media-preview` 或用户导出；关键流程图用 Vision 解读。
5. 对产品、运营、技术、视觉内容执行“信息过滤与设计影响转译”。
6. 核验 PRD 中提到的已有功能，再映射到 `brief.yaml` 字段。

**输出示例字段**：`sources[].type: feishu-doc`

## Adapter：PDF

**触发**：用户上传或提供仓库内 `.pdf` 路径。

**步骤**：

1. 运行 `node scripts/ingest-pdf.mjs <pdf-path> [--out <dir>]`。
2. 读取 `<out>/text.txt` 做结构化抽取。
3. 对 `<out>/pages/*.png` 逐页 Vision：流程图、标注、UI 截图。
4. 文本与 Vision 结论合并；页码记入 `sourceRef`。

**无 poppler 时降级**：

- 请用户导出 PDF 为图片或复制文字；
- 或仅对用户提供的关键页截图做 Vision。

**输出**：`sources[].type: pdf`

## Adapter：图片 / 设计稿截图

**触发**：用户附件、粘贴、或 `refs/*.png` 等路径。

**步骤**：

1. **必须查看图片**（禁止凭文件名猜测）。
2. 识别：屏数、页面类型、信息层级、可点击区域、文案、标注、状态（选中/禁用等）。
3. 多张图时按文件名、页码标注或内容连续性排序为流程。
4. 输出 `visualReferences[]` 与 `pages[]` 补全。

**与 `page-canvas-vision` 的区别**：

| 本 Adapter | page-canvas-vision |
|-----------|-------------------|
| 解读需求与交互 | 映射到 Kit componentId |
| 输出 RequirementBrief | 输出 PageCanvasPlan JSON |
| IX 阶段 | 实现阶段 |

**输出**：`sources[].type: image`

## Adapter：Figma

**触发**：`figma.com/design/...` URL。

**步骤**：

1. 解析 `fileKey` 与 `nodeId`。
2. `get_metadata` — Frame / Section 列表。
3. `get_design_context` — 结构、文案、层级（设计稿领先于 PRD 时以稿为准并标 `source: figma`）。
4. 可选 `get_screenshot` 作 `visualReferences`。

**输出**：`sources[].type: figma`

## Adapter：纯文字 / 对话

用户口述需求且无附件时，直接结构化；所有未给定细节写入 `openQuestions`。

## 合并策略

```text
partial briefs（每源一份）
    → 按 feature / pageId 对齐
    → 一致：confidence 取最高
    → 冲突：写入 conflicts[]，不自动覆盖
    → 仅图有 / 仅文档有：分别标记 visual-only / doc-only
    → 输出 merged brief.yaml
```

## 竞品名提取

从 brief 中识别品类与竞品线索：

- PRD 明示的对标产品
- 功能域默认候选（如 Feed 发布 → Threads, Instagram, X）
- 用户补充列表

供 Phase 2 `design-research` 使用。用户未要求竞品分析时可跳过，但建议在 `openQuestions` 中问一句是否需要。
