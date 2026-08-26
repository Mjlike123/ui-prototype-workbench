# 原型平台 Git 协作操作规范

适用于 **UI 原型工作台**（`ui-prototype-workbench`）日常功能更新与团队协作。

仓库地址：https://github.com/Mjlike123/ui-prototype-workbench

---

## 一、核心原则

1. **不要直接改 `main`** — `main` 是定稿版，所有人共用。
2. **一个功能 = 一个分支 = 一个 PR** — 改完再合并，不要跳过 Review。
3. **合并后通知同事 `git pull`** — 让团队同步最新版本。
4. **只推送核心模块，不带原型创作草稿** — 见下文「推送范围」。

---

## 推送范围：核心模块 vs 原型创作

侧边栏 **原型预览** 下有两个入口，Git 规则不同：

| 入口 | 路由 | 是否提交 GitHub |
|------|------|-----------------|
| **核心模块** | `/canvas/core` | ✅ 验收通过后，走分支 + PR |
| **原型创作** | `/canvas/studio` | ❌ 个人画布，历史在本浏览器，**不要 push** |

### 应该 push / PR 的内容（核心模块）

- `components/prototypes/` 下已验收的交互页面
- 原型注册文件（路由、catalog、router）
- Kit 组件、图标、Token、共用 CSS
- 相关测试与文档

### 不要 push 的内容（原型创作）

- 浏览器 **localStorage** 里的创作历史（如 `toptop-page-canvas-history-v1`）
- 未确定的布局草稿、临时 prompt、试验性方案
- 仅在创作画布里上传、未评审的个人参考图

### 从创作到核心的路径

```text
原型创作（本地探索）→ 评审通过 → 实现为 *-prototype.tsx → PR → merge → 出现在「核心模块」
```

在确定之前，**不要把创作画布里的实验内容混进核心 PR**。

### 代码隔离：改 Studio 不动 Core UI

除 Git 推送范围外，**运行时也要分开**，避免在「原型创作」里改 UI 时影响「核心模块」预览：

| 层级 | 核心模块 | 原型创作 |
|------|----------|----------|
| 路由 | `/canvas/core` | `/canvas/studio` |
| 页面组件 | `components/prototypes/*-prototype.tsx` | `components/studio/*` |
| 页面样式 | `.feedCompose*` 等 Core 命名空间 | `.studioFeedCompose*` 等 Studio 命名空间 |
| 草稿 / 会话 | `feed-compose-session.ts` 等 | `studio-feed-compose-session.ts` 等 |
| 注册入口 | `prototype-preview-showcase.tsx`、`prototype-app-router.tsx` | `page-canvas-showcase.tsx` |

**约定：**

- 你说「在原型创作里做 XXX」→ 只改 `components/studio/` 与 Studio 样式；**不**改 `components/prototypes/` 与 Core catalog。
- 共用 Kit、图标、Token、媒体选择 sheet 可以复用；**页面 shell 布局与存储 key 必须分开**。
- 评审通过后，再 **promote** 到 `*-prototype.tsx` 并走 Core PR（见上路径）。

Cursor 工作区规则见：`.cursor/rules/prototype-git-scope.mdc`（含 `UI separation` 小节）。

---

## 二、标准流程（每次更新功能）

### 第 1 步：同步最新代码

在终端进入项目文件夹：

```bash
git checkout main
git pull origin main
```

从最新定稿版开始，减少与同事改动的冲突。

---

### 第 2 步：新建功能分支

分支名建议：`feat/功能简述`（英文小写，单词用 `-` 连接）

```bash
git checkout -b feat/你的功能名
```

**示例：**

```bash
git checkout -b feat/avatar-3x-list-images
git checkout -b feat/toptop-search-page
git checkout -b feat/private-chat-emoji-panel
```

---

### 第 3 步：本地开发与自测

1. 修改代码（或通过 Cursor / Agent 协助修改）
2. 本地预览：

```bash
npm run portal:dev
```

浏览器打开：http://localhost:3000/canvas/core（核心模块）或 `/canvas/studio`（个人创作，不进 Git）

3. 若改动涉及组件、图标或原型逻辑，建议跑测试：

```bash
npm run portal:test
```

若改动了 `public/icons/` 下的图标资源，测试前会自动执行：

```bash
npm run icons:generate-inline
```

若新增或替换了列表头像位图，可执行：

```bash
npm run avatars:generate-3x
```

---

### 第 4 步：提交到分支

```bash
git status
git add .
git commit -m "一句话说明这次改了什么"
```

也可以只添加相关文件，而不是 `git add .`：

```bash
git add apps/design-system-portal/src/components/prototypes/xxx.tsx
git commit -m "Add xxx prototype screen"
```

**Commit 消息示例：**

- `Use @3x bitmaps for list avatars`
- `Fix private chat menu scroll before lift animation`
- `Add wallet page prototype`

---

### 第 5 步：推送到 GitHub

```bash
git push -u origin feat/你的功能名
```

---

### 第 6 步：在 GitHub 开 Pull Request

1. 打开仓库：https://github.com/Mjlike123/ui-prototype-workbench
2. 点击 **Compare & pull request**（或 **Pull requests → New pull request**）
3. 确认：
   - **Base：** `main`
   - **Compare：** 你的功能分支
4. 填写标题与说明
5. 查看 **Files changed**，确认没有误改同事正在维护的页面
6. 点击 **Create pull request**

**PR 标题模板：**

```
简短说明功能（中文或英文均可）
```

**PR 说明模板：**

```markdown
## Summary
- 改了什么（1～3 条）

## Test plan
- [ ] npm run portal:test
- [ ] 本地预览相关页面
- [ ] 确认未影响同事正在改的原型
```

---

### 第 7 步：合并 PR

1. 确认改动无误后，点击 **Merge pull request**
2. 选择 **Merge**（普通合并）
3. **不要**对 `main` 使用 Force push
4. 合并后可选删除远程分支（GitHub 会提示 **Delete branch**）

---

### 第 8 步：本地同步并通知同事

**你自己：**

```bash
git checkout main
git pull origin main
```

**通知同事（可直接复制）：**

> 平台已更新（简述本次功能）。
>
> 请在本地项目目录执行：
>
> `git checkout main && git pull origin main && npm install && npm run portal:dev`
>
> 然后打开 http://localhost:3000/canvas 检查你的原型页是否正常。
>
> 说明：你的原型文件不会被删除；若本次更新涉及共用组件（如图标、Avatar、全局 CSS），相关页面显示可能会有变化。

---

## 三、分支命名规范

| 类型       | 前缀       | 示例                              |
| ---------- | ---------- | --------------------------------- |
| 新功能     | `feat/`    | `feat/avatar-3x-list-images`      |
| 修 Bug     | `fix/`     | `fix/message-list-scroll`         |
| 样式 / 视觉 | `feat/` 或 `polish/` | `feat/toptop-home-icon-colors` |
| 文档 / 规范 | `docs/`    | `docs/prototype-contribution-guide` |

---

## 四、常见场景怎么处理

| 场景                         | 做法                                           |
| ---------------------------- | ---------------------------------------------- |
| 新增原型页面                 | 新分支 → 改代码 → PR → merge                   |
| 修改共用组件（图标、CSS 等） | 新分支 → PR → **合并前告知同事**（会影响多页） |
| 只改某一个原型页             | 新分支 → PR → merge                            |
| 紧急小修                     | 同样走分支 + PR，不要直接推 `main`             |
| 与同事改了同一文件           | PR 出现冲突 → 本地解决 → 再 push               |
| 同事还在自己分支上开发       | 你 merge 后，同事需在自己的分支执行 `git pull origin main` |

---

## 五、改动影响范围（给非程序员）

本平台中，同事创建的原型是 **仓库里的页面文件**，不是独立数据库。

| 改动类型                     | 会不会删掉同事页面 | 会不会改变显示       |
| ---------------------------- | ------------------ | -------------------- |
| 同事已 merge 的不同页面      | 不会               | 通常无影响           |
| 共用 Kit 组件 / 全局 CSS     | 不会               | 相关页面可能一起变化 |
| 同一文件的同一处             | 不会自动覆盖       | 合并时需人工解决冲突 |

**结论：** Git 不会「后保存者覆盖前者」；正常 PR 合并是「合在一起」，不是「删掉别人的工作」。

---

## 六、禁止事项

| 操作                         | 原因                               |
| ---------------------------- | ---------------------------------- |
| 直接 `git push origin main`  | 容易与同事改动冲突                 |
| `git push --force` 到 `main` | 可能覆盖他人提交                   |
| 不 pull 就 push              | 可能被 GitHub 拒绝或产生混乱       |
| 多个无关功能混在一个 PR      | 难以 Review，也难以回滚            |
| 提交 `.env`、密钥等敏感文件  | 安全风险                           |

---

## 七、流程图

```text
① git checkout main && git pull
        ↓
② git checkout -b feat/xxx
        ↓
③ 改代码 + 本地预览 + 测试
        ↓
④ git add + git commit
        ↓
⑤ git push -u origin feat/xxx
        ↓
⑥ GitHub 开 PR → Review → Merge
        ↓
⑦ 自己 git pull + 通知同事 git pull
```

---

## 八、快捷命令清单

**开始新功能：**

```bash
git checkout main && git pull origin main
git checkout -b feat/功能名
npm run portal:dev
```

**改完提交：**

```bash
git add .
git commit -m "说明"
git push -u origin feat/功能名
```

**合并后同步：**

```bash
git checkout main && git pull origin main
```

**同事在自己分支上继续开发（在你 merge 之后）：**

```bash
git checkout feat/同事的分支名
git pull origin main
# 若有冲突，解决后：
git add .
git commit -m "Merge main"
git push
```

---

## 九、相关文档

- 门户部署：`docs/portal-deploy.md`
- 设计 MVP 验证：`docs/design-mvp-verification.md`

---

## 十、一句话总结

> **每次更新：从最新 `main` 开分支 → 改完 push → 开 PR → merge → 大家 pull。**

这是目前最安全、最适合多人共建原型平台的协作方式。
