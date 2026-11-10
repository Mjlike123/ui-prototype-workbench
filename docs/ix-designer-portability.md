# IX Designer 跨业务与跨 Agent 平台接入

## 目标

同一套交互设计方法可以在不同业务项目中：

1. 读取 PRD、PDF、截图、设计文件或口述需求；
2. 输出可追溯的 RequirementBrief 与 InteractionSpec；
3. 查询目标业务自己的组件、Token、交互规范和已有页面；
4. 生成符合目标项目技术栈的功能原型；
5. 验证状态、交互、可访问性和设计系统一致性。

## 组合模型

```text
ix-designer-core
  + <business>-profile
  + <agent>-adapter
  + user request
```

- Core：只定义 IX 方法与交付语义。
- Profile：定义目标业务的设计系统、知识源、目录、治理和验证。
- Adapter：将抽象能力映射到 Cursor、Claude Code 或自研 Agent 的工具。

TopTop 当前组合：

```text
ix-designer-core + toptop-profile + cursor-adapter
```

旧入口 `toptop-ix-designer` 保留，负责加载上述三层并继续应用既有 TopTop 专项规则。

## 在另一个项目接入

### 1. 安装 Core

复制或通过内部包安装：

```text
.agents/skills/ix-designer-core/
```

Core 不包含 TopTop 组件、路径或术语。

### 2. 创建业务 Profile

从下面的文件复制：

```text
.agents/skills/ix-designer-core/templates/business-profile.example.yaml
```

建立：

```text
.agents/skills/<business>-profile/
  SKILL.md
  profile.yaml
```

至少配置：

- Design principles；
- Token、组件和交互规范来源；
- 已有页面和共享业务模块；
- 草稿与确认后交付目录；
- 是否允许修改生产代码；
- 测试、构建与设计系统验证方式。

Profile 可连接：

- 仓库目录；
- npm/内部组件包；
- HTTP Catalog API；
- MCP 服务；
- 设计系统文档站。

推荐优先提供结构化 ID、Variant、Token 和 Interaction Contract，不能只提供截图。

### 3. 选择 Agent Adapter

Cursor 直接使用：

```text
.agents/skills/cursor-adapter/
```

其他 Agent 平台按 `ix-designer-core/specs/agent-adapter.schema.yaml` 实现自己的 Adapter。最低建议能力：

- `repository.read`
- `repository.search`
- `designSystem.query`
- `repository.write`
- `prototype.render`
- `runtime.inspect`

没有某项能力时声明 fallback；例如不能读取 Figma 时要求导出 Frame，而不是假装已读取设计源。

### 4. 创建业务入口

业务入口保持简短：

```markdown
---
name: example-ix-designer
description: Uses the Example product profile to turn PRDs into UX/UI specifications and functional prototypes.
---

# Example IX Designer

Compose:

1. `ix-designer-core`
2. `example-profile`
3. the active Agent adapter

Apply the user request, then execute the Core workflow.
```

## 一次真实验收

使用目标业务的一份代表性 PRD，检查：

- 能否区分新增、修改、存量和无设计影响内容；
- 能否找到已有页面、组件、Token 与交互模式；
- 能否诚实记录设计系统缺口；
- 能否生成目标项目可运行的功能原型；
- 能否引用真实组件和语义 Token，而不是重新画一套；
- 能否运行目标项目测试、构建和浏览器验收；
- Agent 不具备的能力是否在交付中明确披露。

## 版本与治理

- Core、Profile、Adapter 分别版本化。
- Core Schema 的破坏性变更提升主版本。
- 业务规则只改 Profile，不 fork Core。
- Agent 工具变化只改 Adapter，不改 IX 方法。
- 发布包不得包含个人绝对路径、凭证、未授权 PRD 或私有截图。

分发描述见 `skill/ix-designer-portable.manifest.json`。
