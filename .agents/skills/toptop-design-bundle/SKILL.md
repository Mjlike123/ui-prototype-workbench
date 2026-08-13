---
name: toptop-design-bundle
description: |
  TopTop Agent Design Kit 统一入口。用户询问设计系统、Kit 能力、组件资源、Skill 组合、安装接入或完整原型工作流时使用；具体实现路由到 toptop-design-system，审查路由到 toptop-design-review。
---

# TopTop Agent Design Kit

本 Skill 只负责包级说明和路由，不重复组件规则。

## 目标

```text
Kit 定义边界 → 本地 Agent 搭建原型 → Skills 多维验收 → H5 / iOS 运行时闭环
```

- Portal 可以部署到外网，提供文档、预览、Catalog API 和工作流。
- 推理与代码修改运行在用户本机 Cursor 等 Agent IDE。
- `specs/**/*.yaml` 是单一事实来源，Skill 不得发明组件或 Token。
- `/canvas` 是轻量预览与 Manifest 交接面，不是主要页面编辑器。

## 路由

| 用户意图 | 使用能力 |
|---|---|
| 浏览 Kit、怎么接入、有哪些 Skill | 本 Skill |
| Kit 不完整时做功能原型、布局探索和创意方向 | `toptop-prototype-studio` |
| 已有较完整 Kit，需要严格实现生产页面 | `toptop-design-system` |
| 审查视觉、设计规范和交互逻辑 | `toptop-design-review` |
| 深度五维审查 | `monkren-design → 5-dim-review` |
| 截图切图与像素还原 | `yueban-image-to-code` |
| iOS 实机验收 | Lookin，本地运行，非原型前置依赖 |

## 权威来源

按以下顺序读取，避免把整个仓库灌入上下文：

1. `PROJECT.md`：项目边界与工作流。
2. `specs/principles/core-design-principles.yaml`：设计决策顺序与验收问题。
3. `specs/foundations/*.yaml`：Token 与视觉基础。
4. 当前任务涉及的 `specs/components/<id>.yaml`。
5. 对应 `content/components/<id>.mdx`。
6. 相关 `specs/interactions/*.yaml`。

## 快速开始

```bash
npm run portal:dev
npm run specs:validate
npm run verify:mvp
```

Portal 入口：

- `/getting-started`：人和 Agent 的协作方式。
- `/components`：组件契约与真实预览。
- `/canvas`：Manifest 与视觉参考交接。
- `/governance`：生命周期和发布规则。

## 禁止

- 不要把 Portal 描述为托管 Cursor 模型的服务。
- 不要要求用户为了生成原型先手工拼完画布。
- 不要强迫 9 个 Kit 组件承担所有页面内容；缺失区域进入 Hybrid Prototype。
- 不要把 Lookin 作为原型搭建的前置依赖。
- 不要在 Skill 中复制一套与 YAML 不一致的固定视觉值。
