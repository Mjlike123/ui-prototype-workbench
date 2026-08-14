# IM 自定义表情 · 设计头脑风暴

**日期：** 2026-08-14  
**范围：** 私聊 IM · 自定义表情 / 贴纸发送与复用  
**模式：** Hybrid Prototype（`toptop-prototype-studio`）  
**基线：** 海外主流社交 IM（Discord / Telegram / Slack / Messenger / LINE）

---

## 1. 问题定义

### 用户任务

在私聊中快速发送**有身份感、可复用**的表情，而不只是系统 Unicode emoji 或一次性图片。

### 完成条件

1. 从输入区打开表情面板，≤2 次点击发送一条自定义表情消息  
2. 最近使用 / 收藏可在下次会话中快速找到  
3. 发送后在气泡内正确展示，并可被回复引用（已有 `kind: emoji` 原型路径）  
4. 上传或管理自定义表情时有明确状态反馈（成功 / 审核中 / 失败）

### 当前 Kit 基线

| 已有 | 路径 | 状态 |
|---|---|---|
| 表情入口 | `chat-input` → `emojiAction` | stable |
| 私聊输入壳 | `ChatInput` + `onEmoji` | 已实现 |
| 贴纸消息展示 | `private-chat-prototype` → `kind: emoji` | prototype |
| 回复预览 | `prototype-chat-reply` → sticker thumbnail | prototype |

| Kit gap | 说明 |
|---|---|
| 表情面板 | 无 `emoji-picker` / `sticker-panel` 组件契约 |
| 自定义表情 CRUD | 无上传、命名、审核 UI 规范 |
| `chat-bubble` 贴纸类型 | YAML 未声明 `emoji` / `sticker` content kind |

### 品类常见模式（基线，非推荐）

- **Unicode emoji 键盘**：iOS / WhatsApp 默认，零学习成本但无品牌/关系表达  
- **第三方贴纸包**：LINE / Telegram Store，消费导向，创建门槛高  
- **Workspace 自定义**：Slack / Discord，成员共创，需治理与尺寸规范  
- **相机衍生贴纸**：Snap / IG，从人像一键生成，强传播但 IM 内链路长  

---

## 2. 跨领域参考

| 领域 | 可迁移机制 | 适用点 |
|---|---|---|
| **Discord（社区工具）** | 128×128 上传、`:shortcode:`、Server 级归属、Moderation 队列 | 自定义表情 = 小图 + 名称 + 权限 |
| **Telegram（消息平台）** | Sticker pack 独立消息、Recent/Favorites、动画贴纸 | 面板 Tab + 大图发送模型 |
| **Slack（工作协作）** | Admin 审批、Workspace 共享、输入框 inline 替换 | 治理与命名规范 |
| **Snap（相机表达）** | 3-step 生成个人 sticker、Bitmoji 常驻首位 | 降低创建门槛 |
| **Spotify（收藏习惯）** | Recent / Liked 双轨、跨会话记忆 | 「最近用过」排序逻辑 |

---

## 3. 五个方向

### 方向 A · 稳妥 — Tab 表情面板（Discord × Telegram）

**结构：**

```text
┌─────────────────────────────── RegularNavigation (optional) ─┐
│ Chat thread                                                   │
├───────────────────────────────────────────────────────────────┤
│ Reply bar (optional)                                          │
├───────────────────────────────────────────────────────────────┤
│ [ Recent | Emoji | Custom | Stickers ]  ← Secondary Tab       │
│ ┌────┬────┬────┬────┐                                         │
│ │ 🕘 │ 😀 │ 🫶 │ 🎮 │  4–8 col grid                           │
│ └────┴────┴────┴────┘                                         │
│ [ + Add custom ]                                              │
├───────────────────────────────────────────────────────────────┤
│ ChatInput (Kit stable)                                        │
└───────────────────────────────────────────────────────────────┘
```

- **机制：** Custom Tab 展示用户/房间上传的小图；Stickers Tab 展示官方与联名包；Recent 合并两者  
- **发送：** 点击即发送独立贴纸气泡（对齐现有 `kind: emoji`）  
- **价值：** 与海外 Discord/Telegram 心智一致，可渐进上线  
- **风险：** 需定义尺寸、审核、命名；Tab 过多可能拥挤  
- **验证：** 5 用户完成「打开面板 → 发自定义表情 → 回复引用」任务测试  

---

### 方向 B · 精炼 — Inline 自定义 emoji（Slack 模型）

**结构：**

```text
输入框: "Good game :toptop_wink:"
                 ↓ 发送
气泡: Good game [32px custom img]
```

- **机制：** 自定义表情作为**行内短代码**插入文本，而非独立气泡  
- **价值：** 文字 + 表情混排，适合轻量表达  
- **风险：** H5 渲染、复制粘贴、无障碍朗读复杂；与现有 sticker 气泡双轨  
- **验证：** 对比独立气泡，测消息列表扫描效率  

---

### 方向 C · 新颖 — Tribe / Room 共享表情库（游戏公会）

**结构：**

```text
Custom Tab
├─ My uploads (3)
├─ Tribe "Night Owls" (12)  ← 成员共创
└─ Room "KSA Rank" (8)      ← 房间上下文
```

- **机制：** 自定义表情绑定**社交关系上下文**，离开 Tribe 仍保留「曾获得」但不可新增  
- **价值：** 契合 TopTop 语音房 / Tribe 业务，差异化于纯 DM 工具  
- **风险：** 权限与同步逻辑重；冷启动无 pack  
- **验证：** 房间内会话 vs 纯私聊，看使用率差异  

---

### 方向 D · 跨领域 — 3 步照片贴纸（Snap 相机链路）

**流程：**

```text
ChatInput [+] → Take/Choose photo → Auto cutout → Name → Add to Custom
```

- **机制：** 从相册/相机一键抠图生成个人 sticker，首屏强引导  
- **价值：** 降低创作门槛，提高 UGC  
- **风险：** 抠图质量、性能、审核；超出当前 Kit，原型只能模拟  
- **验证：** 创建完成率 vs 方向 A 的手动上传  

---

### 方向 E · 跨领域 — 表达 streak 排序（Spotify 习惯）

**机制：** Recent Tab 不按时间纯排序，而按**关系亲密度 + 使用频次**加权；连续 7 天与同一人聊天解锁「双人专属」上传槽  

- **价值：** 激励复用而非一次性 spam  
- **风险：** 算法不透明；与「清晰简单」原则张力  
- **验证：** A/B 看 7 日留存与表情发送频次  

---

## 4. 推荐方向

**推荐：方向 A（Tab 表情面板）为主，方向 C 的 Tribe 分组作为 Custom Tab 二级筛选。**

### 理由（清晰简单 → 一致规律 → 包容开放）

1. **清晰简单：** 一次点击表情按钮 → 面板展开 → 再点即发送；不引入 shortcode 学习成本  
2. **一致规律：** 复用 `chat-input` 稳定入口 + 现有 sticker 气泡展示；面板作为 Prototype 模块叠加  
3. **包容开放：** Custom Tab 先支持「我的上传」，Tribe/Room pack 作为后续 Variant，不阻塞 MVP  

### 暂不首选

- **方向 B：** 工程与 a11y 成本高，适合第二期  
- **方向 D：** 可作为 Custom Tab 内「从照片创建」子流程，不单独做首页  
- **方向 E：** 适合数据验证阶段，不宜进首版原型  

---

## 5. Hybrid 组件映射（推荐实现）

```json
{
  "intent": "im-custom-emoji",
  "viewport": "375×812",
  "layers": [
    { "componentId": "regular-navigation", "role": "私聊顶栏", "source": "kit" },
    { "componentId": "chat-bubble", "role": "贴纸消息气泡", "source": "kit + prototype gap" },
    { "componentId": "chat-input", "role": "表情入口 emojiAction", "source": "kit" },
    { "componentId": "secondary-tab-underline", "role": "Recent / Emoji / Custom / Stickers", "source": "kit" },
    { "id": "PrototypeEmojiPanel", "role": "表情面板容器", "source": "prototype" },
    { "id": "PrototypeCustomEmojiGrid", "role": "自定义表情网格", "source": "prototype" },
    { "id": "PrototypeEmojiUploadEntry", "role": "添加入口与审核态", "source": "prototype" }
  ],
  "kitGaps": [
    "emoji-picker / sticker-panel 组件契约",
    "chat-bubble 未声明 sticker content kind",
    "自定义表情上传规范（尺寸、格式、命名）"
  ]
}
```

### 海外产品对照（首版 MVP 范围）

| 能力 | Discord | Telegram | 推荐 MVP |
|---|---|---|---|
| 面板 Tab | ✅ | ✅ | Recent + Custom |
| 上传 PNG | ✅ 128×128 | ✅ 512 包 | PNG 128×128，单张上传 |
| 独立气泡发送 | ❌ inline | ✅ | ✅ 对齐 Telegram |
| 审核队列 | ✅ | ✅ | 原型用「审核中」态 Toast |
| 房间/群归属 | ✅ Server | ✅ Pack | Phase 2：Tribe 分组 |

---

## 6. 原型验证清单

- [ ] 点击 `chat-input` 表情按钮 → 面板展开/收起，键盘不遮挡  
- [ ] Custom 网格发送 → 气泡展示 `/prototypes/chat-reply/sticker.png` 类资产  
- [ ] Recent 记录最近 8 个  
- [ ] 上传入口 → 模拟成功 / 审核中反馈  
- [ ] 回复引用贴纸消息摘要正确  
- [ ] `npm run portal:test` 通过  

---

## 7. 下一步

1. 在 `private-chat-prototype` 实现 `PrototypeEmojiPanel`（方向 A）  
2. Manifest 写入 `prototype-preview-showcase`  
3. 验证后评估是否起草 `emoji-picker` YAML（draft）  
