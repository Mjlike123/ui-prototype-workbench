# 组件验收知识库

组件验收使用 `specs/components/*.yaml` 中的版本化规范。规范是可执行的
验收标准，不是对 Figma 原始节点逐层比较。

同一份 YAML 也由 TopTop Design System Portal 读取。审计字段
`detection/roles/rules` 之外，Portal 使用以下可选字段：

- `status/category/tags`：治理状态与检索分类。
- `previewKey/variants/props/anatomy`：React 参考实现和组件契约。
- `reference.figmaUrl/reference.nodeId`：默认 Kit 验收使用的设计来源。
- `tokenRefs/interactionIds/platformMappingIds`：连接视觉基础、交互和多端实现。
- `accessibility`：键盘、读屏、动态文案与点击区域要求。

人工说明和正反案例维护在 `content/**/*.mdx`。Figma 同步只写
`generated/figma/index.json`，不会修改 YAML 或 MDX。

提交前运行：

```bash
npm run specs:validate
```

## 二级 Tab 的语义边界

- `container`：用户在 Lookin 中选择的二级 Tab 根容器。
- `tabItem`：包含一段标签文字的最小可视/可交互容器。
- `label`：标签文字节点。
- `selectedItem`：设计稿当前选中状态对应的 Tab。
- `unselectedItem`：其余 Tab。

首版只检查以下标准：

1. 组件整体高度。
2. 每个按钮的宽度和高度。
3. 文字相对按钮背景的左、右内边距。
4. 相邻 Tab 的水平间距。
5. 选中态文字色和背景色。
6. 未选中态文字色和背景色。

同一标准影响多个 Tab 时只生成一条问题，详情列出受影响的标签。匿名
Figma Frame、iOS 包装 View、阴影层和装饰层不会独立生成问题。

## 新增组件规范

1. 复制一个现有 YAML，使用稳定的 kebab-case `id` 并提升 `version`。
2. 在 `detection.figmaComponentIds` 填写正式 Figma 组件 ID；名称别名只作为
   老设计稿的降级识别方式。
3. 定义语义角色和规则白名单。未写入规则的属性默认不验收。
4. 为设计与 Lookin 子树各增加 fixture，并声明预期问题上限。
5. 规范变更需要设计系统负责人评审；历史审计会话保留规范 ID 和版本。

## TopTop 接入约定

- Figma 组件库中的组件和实例应保留稳定 componentId，并使用清晰的
  variant 属性，例如 `State=Selected`。
- Lookin 默认先通过 `specs/platform-mappings/*.yaml` 中的 iOS
  `componentName/identifiers` 识别选中模块，再读取组件 Profile 的
  `reference.figmaUrl`，因此标准组件不需要人工粘贴 Figma 链接。
- iOS 关键组件建议提供：
  - 根容器：`audit.secondaryTab`
  - Tab：`audit.secondaryTab.<业务标识>`
  - 文字：`audit.secondaryTab.<业务标识>.label`
- 动态文案可变化时仍优先使用 accessibilityIdentifier；否则审计器按文字和
  从左到右顺序降级匹配。
- 如果语义角色无法可靠提取，审计器只提示“组件结构需确认”，不输出大量
  低置信度节点问题。
- 业务实例和通用节点不具备稳定 Kit 映射，仍需提供具体 Figma Frame。
