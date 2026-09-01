---
name: ojo-design-skills
description: |
  OJO 官方开源设计方法论入口（MIT）。用于 0→1 视觉探索、Landing Page、品牌方向、设计审计、反 AI 味护栏；不替代 TopTop Kit 约束下的核心原型实现。触发词：OJO、视觉方向、design tokens、设计审计、反 AI 味、Landing Page 从零设计。
---

# OJO Design Skills

本仓库已安装 [OJO-Design-Skills](https://github.com/touchine-ojo/OJO-Design-Skills) 的核心 Skill，路径：

- **入口（本文件）**：`.agents/skills/ojo-design-skills/SKILL.md`
- **核心方法论**：`.agents/skills/app-ui-ux-best-practices/SKILL.md`
- **9 份参考**：`.agents/skills/app-ui-ux-best-practices/references/*.md`
- **安装记录**：`.agents/skills/.ojo-design-skills-install.json`

无需 ojo.art 订阅或 session token；纯本地 Markdown，MIT 许可。

## 何时用 OJO vs TopTop Kit

| 场景 | 用哪个 |
|---|---|
| TopTop 核心模块原型（Feed / IM / Me 等，已有 Kit） | `toptop-design-system` + `toptop-prototype-studio` |
| 严格按 `specs/**/*.yaml` 实现组件 | `toptop-design-system` |
| 设计规范 / 交互审查 | `toptop-design-review` |
| **0→1 新页面、Landing、品牌探索、无 Kit 覆盖区域** | **本 Skill → `app-ui-ux-best-practices`** |
| 反 AI 味、视觉方向、Token 草案、设计审计 | **本 Skill → `app-ui-ux-best-practices`** |

**冲突规则：** OJO 默认产出 Tailwind 自由 UI；进入 TopTop 核心原型前，必须把 Token / 组件映射回 `specs/` 与 `components/kit`，不得把 OJO 的色值直接写进 Kit YAML。

## 怎么用（Cursor）

### 1. 手动挂载（推荐）

在对话里 @ 引用或粘贴：

```text
请读取并遵循 .agents/skills/app-ui-ux-best-practices/SKILL.md
```

或 @ 本入口 Skill：`ojo-design-skills`。

### 2. 自然语言触发

Agent 检测到以下意图时应加载 OJO Skill：

- 「用 OJO 做视觉方向」
- 「设计系统 / design tokens / 视觉设计」
- 「Landing Page 从零设计」
- 「设计审计 / 反 AI 味」

### 3. 典型工作流

```text
产品简报
  → 读 anti-patterns.md（强制）
  → 选轨道：Convention（SaaS/工具）或 Innovation（品牌驱动）
  → 给出 2–3 个视觉方向，等用户选定
  → 产出 visual tokens + component recipe + motion
  → （若进 TopTop 原型）映射到 specs/ + Kit 组件
```

**Convention Track**：借鉴 Notion / Linear / Stripe 等成熟语言。  
**Innovation Track**：材质隐喻、原型、叙事、文化符号等方法。

### 4. 参考文件速查

| 文件 | 用途 |
|---|---|
| `references/anti-patterns.md` | 反 AI 味、禁色、占位图规则（**必须先读**） |
| `references/visual-tokens.md` | 颜色、字体、间距 Token |
| `references/component-recipe.md` | 组件配方、8 态交互 |
| `references/motion-system.md` | 弹簧动效 |
| `references/material-metaphor.md` | 创新轨道材质隐喻 |
| `references/design-audit.md` | 设计质量审计清单 |
| `references/hero-enrichment.md` | Hero 区 enrichment |
| `references/icon-guidelines.md` | 图标规范 |
| `references/component-libraries.md` | 可参考组件库 |

## 更新 Skill

```bash
curl -fsSL https://raw.githubusercontent.com/touchine-ojo/OJO-Design-Skills/main/scripts/install.sh \
  | bash -s -- --target generic \
    --dest /Users/tiantian/Documents/ui-audit-tool/.agents/skills \
    --force
```

更新后重启或重载 Cursor Agent，使新 Skill 生效。

## 禁止

- 不要用 OJO 覆盖或改写 `specs/**/*.yaml` 里已稳定的 TopTop Token / 组件契约。
- 不要在核心原型（`components/prototypes/*`）里绕过 Kit 直接写 Tailwind 重复组件。
- 不要把 ojo.art 浏览器 session token 写进仓库或脚本。
