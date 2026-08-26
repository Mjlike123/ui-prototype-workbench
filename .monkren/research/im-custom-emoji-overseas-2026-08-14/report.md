# 海外 IM 自定义表情 · 设计研究报告

**日期：** 2026-08-14  
**研究问题：** 海外主流 IM 如何实现「自定义表情 / 贴纸」？TopTop 私聊应借鉴哪些模式、规避哪些坑？  
**决策用途：** 指导 TopTop UI 原型工作台私聊 `PrototypeEmojiPanel` 的 Phase 2 产品规格与 Kit 沉淀  
**证据范围：** 官方帮助文档、开发者 API 文档、Meta/WhatsApp 帮助中心；未使用付费灵感库或实机截图

---

## 摘要与建议

海外 IM 的「自定义表情」并非单一功能，而是 **三条产品线的组合**：

| 产品线 | 代表产品 | 用户心智 |
|--------|----------|----------|
| **A. 行内小图 emoji** | Discord、Slack | 在文字里插 `:name:`，像标点一样快 |
| **B. 独立贴纸消息** | Telegram、WhatsApp | 点一下发一张大图，表达情绪为主 |
| **C. 身份化贴纸** | Instagram/Messenger Avatar、Snap Bitmoji | 从人像/虚拟形象自动生成，低创作门槛 |

**对 TopTop 的明确建议：**

1. **采用（继续）** — **B + 面板 Tab**：Recent / Emoji / Custom，Custom 点击即发送独立气泡（与已上线原型一致，对齐 Telegram/WhatsApp 发送模型）。
2. **Phase 2 追加** — **Pack 分组**（个人 / Tribe / Room）+ **命名规范**（2–32 字符、无空格），参考 Discord Server emoji 与 Telegram sticker set。
3. **Phase 2 追加** — **上传规格公开化**：128×128 静态 PNG/WebP、≤256KB；审核中 / 已通过 / 已拒绝三态（参考 Discord 权限 + Slack 治理）。
4. **可选探索** — 从照片一键抠图创建（Telegram Sticker Editor、WhatsApp Create from photo），作为 Custom Tab 内子流程，不单独做首页。
5. **暂不采用** — 纯 Slack/Discord 式 `:shortcode:` 行内替换作为唯一模型（H5 渲染、a11y、复制粘贴成本高）；可保留 Emoji Tab 插入 Unicode 作为轻量补充。

**避免：**

- 只做 Unicode 键盘却不支持自定义（表达力不足）
- 无 Pack / Recent 治理，让用户在几百张图里翻找
- 上传后无审核反馈（海外产品普遍有格式校验 + 权限/治理）
- 把 512×512 贴纸规范硬套到 128×128 行内 emoji 场景

---

## 当前状态（TopTop）

| 项 | 状态 |
|----|------|
| 入口 | `chat-input` · `emojiAction`（stable） |
| 面板 | `PrototypeEmojiPanel`：Recent / Emoji / Custom |
| 发送 | Custom → `kind: emoji` 独立气泡 + `mediaSrc` |
| Unicode | Emoji Tab → 插入草稿，需手动发送 |
| 上传 | 原型模拟「审核中」项 + Toast |
| Kit gap | 无 `emoji-picker` YAML；`chat-bubble` 未声明 sticker kind |

详见仓库：`.monkren/brainstorm/im-custom-emoji-2026-08-14/report.md`、私聊原型 `prototype-emoji-panel.tsx`。

---

## 研究范围与证据限制

- **直接竞品：** Discord、Telegram、Slack、WhatsApp、Messenger/Instagram DM  
- **相邻参考：** LINE 贴纸商店（消费型，非 UGC 主路径）、Snap Bitmoji（身份贴纸）  
- **未覆盖：** 微信/QQ 国内路径、各产品最新 A/B 界面像素级对比、各地区审核政策细则  
- **降级说明：** 无 Mobbin 等登录灵感库；结论以官方文档与 API 规范为主

---

## 竞品 / 相邻案例

### 1. Discord — 社群 scoped 行内 custom emoji

**模型：** 表情绑定 **Server（.guild）**；成员在频道内通过 `:name:` 或 picker 使用。

| 维度 | 做法 |
|------|------|
| 规格 | 推荐 128×128；PNG/GIF/WebP/AVIF；≤256KB |
| 命名 | 2–32 字符，仅字母数字与下划线 |
| 槽位 | 默认 50 静态；Nitro 等扩展 animated 槽位 |
| 权限 | `Manage Emojis` / `Create Expressions` |
| 上传入口 | Server Settings → Emoji；**也可从 emoji picker 内直接 Upload** |
| 跨服使用 | Nitro 订阅者可在其他服使用（可被服主禁用） |

**启示：** 自定义 emoji 是 **社区资产**，不是纯个人收藏；picker 内上传缩短路径；规格与命名在 UI 内可见。

**来源：** [Discord Support – Custom Emojis](https://support.discord.com/hc/en-us/articles/360036479811-Custom-Emojis)、[Discord Developer – Emoji API](https://docs.discord.com/developers/resources/emoji)、[Discord Blog – Beginner's Guide](https://discord.com/blog/beginners-guide-to-custom-emojis)

---

### 2. Telegram — 贴纸包 + 聊天内 Sticker Editor

**模型：** **Sticker set**（最多约 120 张/包，custom emoji set 可达 200）；点击发送 **独立贴纸消息**；与文字混排方式不同于 Discord inline。

| 维度 | 做法 |
|------|------|
| 创建 | @Stickers bot；**聊天内 Sticker Editor**（照片→贴纸+文字+涂鸦） |
| 格式 | 静态 PNG/WebP；动态 TGS/WEBM；每张贴纸需关联 emoji 情绪标签 |
| 分发 | `t.me/addstickers/<pack>` 链接分享整包 |
| 平台 | 开放 [stickers 平台](https://core.telegram.org/stickers) + Import API |
| Custom emoji | Bot API `sticker_type: custom_emoji`，可 `needs_repainting` 适配主题色 |

**启示：** **Pack + 链式分享** 是主流；**聊天内编辑** 降低 UGC 门槛；Recent/Favorites 在客户端层必备。

**来源：** [Telegram Stickers Platform](https://core.telegram.org/stickers)、[Importing Stickers](https://core.telegram.org/import-stickers)、[Bot API createNewStickerSet](https://core.telegram.org/bots/api#createnewstickerset)

---

### 3. Slack — Workspace 级 inline emoji + 开放治理

**模型：** 全 workspace 共享；消息内 **`:emoji_name:`** 渲染为小图；与 Discord 类似但偏工作场景。

| 维度 | 做法 |
|------|------|
| 规格 | 128×128 推荐；18–1024px；PNG/JPG/GIF；≤128KB |
| 槽位 | **无硬上限**（可上千） |
| 权限 | 默认全员可上传；Owner 可限制为仅管理员 |
| 入口 | Emoji picker → **Add Emoji**；或 Workspace Customize |
| 别名 | 支持 emoji alias，降低记忆 `:code:` 成本 |

**启示：** 治理开关（谁可以上传）比槽位限制更重要；上传前 **light/dark 预览** 值得借鉴。

**来源：** [Slack – Add custom emoji](https://slack.com/help/articles/206870177-Add-custom-emoji-and-aliases-to-your-workspace)、[Manage custom emoji permissions](https://slack.com/help/articles/115005043766-Manage-custom-emoji-permissions)

---

### 4. WhatsApp — 个人 sticker pack + 照片/AI 创建

**模型：** **个人 sticker pack**（最多 30 张/包）；以 **独立贴纸消息** 发送；2025 起强化 pack 组织与分享。

| 维度 | 做法 |
|------|------|
| 创建 | 聊天内 Create：照片抠图、AI Generate、添加到 pack |
| 规格 | 512×512；静态 ≤100KB；透明背景；建议 8px 白描边 |
| 分享 | 整包分享给联系人 |
| 开发者 | 独立 App + [WhatsApp/stickers](https://github.com/WhatsApp/stickers) API（第三方 pack） |

**启示：** **Pack 分享** 是增长路径；**照片→贴纸** 是低门槛 UGC；512 规格适合「大图贴纸」，不适合 TopTop 若要做行内小 emoji。

**来源：** [WhatsApp – Create sticker packs](https://faq.whatsapp.com/1056840314992666)、[Design custom stickers](https://faq.whatsapp.com/4148445205479237)

---

### 5. Messenger / Instagram — Avatar 贴纸（身份化，非上传 PNG）

**模型：** 用户先建 **Meta Avatar**，系统在 DM/Sticker tray 生成 **Avatar sticker pack**；2024+ 扩展 DM sticker tray、favorites、cutout stickers。

| 维度 | 做法 |
|------|------|
| 创建 | Accounts Center 捏脸，非自由上传 |
| 使用 | DM → Sticker icon → Avatar section |
| 跨 app | IG / Messenger / Facebook 账号连通后共享 |
| 趋势 | 官方 sticker pack 更新 + 用户 favorite 复用 |

**启示：** 「自定义」可以是 **生成式身份** 而非上传；TopTop 若强社交关系，可预留 Avatar/Tribe 皮肤贴纸，与 PNG 上传并存。

**来源：** [Messenger – Avatar stickers](https://www.facebook.com/help/messenger-app/260974289445028/)、[Meta – New DM features](https://about.fb.com/news/2024/11/new-ways-to-connect-through-dms/)

---

### 6. LINE（相邻）— 商店消费为主

**模型：** 官方/创作者 **Sticker Shop** 下载 pack；用户 **不自建** 为主路径。适合商业化，不适合作为 TopTop UGC 首版对标。

---

## 模式与反模式

### 模式 1 · Tab 化表情面板（Recent / Emoji / Stickers / Custom）

- **用途：** 统一入口，降低「去哪找自定义」的认知负担  
- **优点：** Telegram、WhatsApp、Instagram 均采用 tray + tab；与 TopTop 原型一致  
- **风险：** Tab 过多（>4）会挤占键盘上方空间  
- **适用：** 移动端 H5 / App 私聊  
- **TopTop：** ✅ 已采用 Recent / Emoji / Custom；Phase 2 可加 **Stickers（官方包）**

### 模式 2 · 独立贴纸气泡 vs 行内 emoji

- **独立气泡：** Telegram、WhatsApp — 大图、情绪表达、易回复引用  
- **行内 emoji：** Discord、Slack — 混在句子中、密度高  
- **建议：** TopTop 私聊 **默认独立气泡**；群聊/评论区可再评估 inline  

### 模式 3 · Pack 作为治理与分享单元

- **用途：** 命名、审核、分享、下架都以 pack 为单位  
- **优点：** 用户心智清晰；便于 Tribe/Room 归属  
- **风险：** 单张上传也要选 pack，多一步  
- **TopTop：** Custom Tab 内增加「My pack / Tribe pack」筛选  

### 模式 4 · 上传规格前置 + 失败可解释

- **Discord/Slack：** 128×128、体积上限、命名规则；失败即拒  
- **反模式：** 上传后静默失败或审核黑盒  
- **TopTop：** 上传页展示 spec + 示例；原型已有「审核中」态，需补 **拒绝原因**  

### 模式 5 · 权限与 scoped 库

- **Discord：** Server 级 + 角色权限  
- **Slack：** Workspace 级 + 全员/管理员开关  
- **TopTop 映射：** 个人 Custom / **Tribe 共享** / **Room 临时**（头脑风暴方向 C）  

### 模式 6 · 照片 / AI 低门槛创建

- **Telegram：** 聊天内 Sticker Editor  
- **WhatsApp：** 照片抠图 + AI Generate  
- **适用：** 提高 UGC 供给；需 moderation  
- **TopTop：** Phase 3；MVP 保持「上传 PNG + 审核」  

### 反模式

| 反模式 | 问题 |
|--------|------|
| 只有 Unicode 键盘 | 无身份表达，社交产品差异化弱 |
| 无 Recent | 重复发送自定义表情成本 high |
| 512 贴纸当行内 emoji 用 | 排版炸裂、流量浪费 |
| 无 pack 无限堆图 | 检索失败，picker 失效 |
| 跨 context 强制共享 | Discord Nitro 跨服引发权限争议 |

---

## 对 TopTop 的应用

### 与现有原型的对齐度

| 海外模式 | TopTop 原型 | 差距 |
|----------|-------------|------|
| Tab 面板 | ✅ Recent/Emoji/Custom | 缺官方 Stickers tab |
| 独立气泡发送 | ✅ Custom 点击发送 | — |
| Unicode 插入 | ✅ Emoji tab → 草稿 | 与 Custom 行为不一致（可接受） |
| Pack 分组 | ❌ | Phase 2 |
| 上传 spec UI | ❌ | 仅 Toast 模拟 |
| Tribe/Room scoped | ❌ | Phase 2 |
| 照片创建 | ❌ | Phase 3 |

### Phase 2 规格建议（可直接进 PRD）

```text
Custom Emoji Spec（建议对齐 Discord 静态 emoji，非 WhatsApp 512）
- 尺寸：128×128 px（长边），透明 PNG/WebP
- 体积：≤ 256 KB
- 命名：2–32 字符，[a-z0-9_]
- Pack：Personal（默认）+ Tribe（可选）
- 状态：pending | active | rejected（带原因）
- 面板：Recent 8 项；Custom 4 列网格；Add 入口

发送语义
- Custom / Sticker pack 项 → kind:emoji 独立气泡（96–128dp 展示）
- Unicode tab → 插入 composer 草稿，Enter 发送文本消息
```

### Kit 沉淀路径

1. 原型验证 Pack + 审核三态 → 起草 `emoji-picker` YAML（draft）  
2. `chat-bubble` 增加 `sticker` content kind 与 spec 引用  
3. 若 Tribe pack 重复出现 → 评估 `sticker-pack` 业务组件（review）

### 下一步验证（用户测试）

1. 用户能否在 10 秒内从 picker 发出一张 Custom 贴纸？  
2. Recent 是否覆盖 80% 重复发送？  
3. 「审核中」是否足够清晰，不会重复上传？  
4. Tribe pack vs 个人 pack 是否需解释文案？

---

## 来源

| # | 来源 | URL |
|---|------|-----|
| 1 | Discord Help – Custom Emojis | https://support.discord.com/hc/en-us/articles/360036479811-Custom-Emojis |
| 2 | Discord Developer – Emoji Resource | https://docs.discord.com/developers/resources/emoji |
| 3 | Discord Blog – Custom Emoji Guide | https://discord.com/blog/beginners-guide-to-custom-emojis |
| 4 | Telegram Stickers Platform | https://core.telegram.org/stickers |
| 5 | Telegram – Importing Stickers | https://core.telegram.org/import-stickers |
| 6 | Telegram Bot API – createNewStickerSet | https://core.telegram.org/bots/api#createnewstickerset |
| 7 | Slack Help – Add custom emoji | https://slack.com/help/articles/206870177-Add-custom-emoji-and-aliases-to-your-workspace |
| 8 | Slack Help – Emoji permissions | https://slack.com/help/articles/115005043766-Manage-custom-emoji-permissions |
| 9 | WhatsApp Help – Sticker packs | https://faq.whatsapp.com/1056840314992666 |
| 10 | WhatsApp Help – Design stickers | https://faq.whatsapp.com/4148445205479237 |
| 11 | WhatsApp Stickers GitHub | https://github.com/WhatsApp/stickers |
| 12 | Messenger Help – Avatar stickers | https://www.facebook.com/help/messenger-app/260974289445028/ |
| 13 | Meta – Instagram DM updates (2024) | https://about.fb.com/news/2024/11/new-ways-to-connect-through-dms/ |
| 14 | TopTop 内部 brainstorm | `.monkren/brainstorm/im-custom-emoji-2026-08-14/report.md` |
| 15 | TopTop 私聊原型 | `apps/design-system-portal/src/components/prototypes/prototype-emoji-panel.tsx` |
