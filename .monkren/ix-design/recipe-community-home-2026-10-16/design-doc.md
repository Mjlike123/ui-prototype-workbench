# 配方社区首页 · 三方案改版原型

**日期**：2026-10-16  
**载体**：Studio 项目 `recipe-community-redesign`（`/canvas/studio/recipe-community-redesign`）  
**黑底设计稿（静态）**：`wireframes/index.html` — 浏览器打开可打印 PDF  
**黑底截图导出**：`exports/*.png`（由 `node scripts/capture-recipe-community-design.mjs` 生成）  
**无壳截图 URL**：`/prototype-runtime/studio/recipe-community-redesign?theme=dark&scene=fujistyle&width=375&height=812`  
**对标**：Filmsim Recipes（竞品截图参考）/ FujiStyle / Fuji Recipes / Recipe Room  
**竞品参考图**：`public/prototypes/studio/filmsim-recipes-reference.jpg`  

## D · Filmsim 页面映射（竞品 → 你的改版）

| 竞品模块 | Filmsim 做法 | 可迁移到你方改版 |
|---------|-------------|-----------------|
| 顶栏 | 品牌字标 + 通知 + 头像 | 保留「配方社区」品牌，右侧通知/同步/头像 |
| 搜索 | 全宽灰底搜索框 | 与筛选分离，占位「配方/风格/创作者」 |
| Pro 条 | 黑卡横幅 + 订阅配方数 | 可换成「写机 Pro」或「官方精选组」 |
| 筛选 | 「适合我的 X-T50」+ 心情/模拟/相机下拉 | **单一筛选带**，解决重复 chip |
| 列表头 | 「153 个配方」+ 热门/最新/A-Z | 结果数 + 排序 Tab，不再第三层分类 |
| 卡片 | 双列：图 + 赞 + 标题 + 模拟名 + @作者 | 固定字段顺序，模拟名全大写可读 |
| 底栏 | 配方 Tab 选中 + 红色相机 FAB | 写机/拍摄主 CTA 抬到一级 |

## 模块对照表（→ 改版清单）

| 模块 | A FujiStyle | B Fuji Recipes | C Recipe Room | 改版清单 |
|------|-------------|----------------|---------------|----------|
| 顶栏 | 社区 Tab + 搜索 + 头像 | 机身连接 + 同步 + 搜索 | 发现 + 作品/配方分段 | P0 单一导航；相机上首页 |
| 筛选 | 场景 chip + Hero 编辑推荐 | 传感器/模拟/场景，一处 Sticky | 分段各自筛选维度 | P0 去三层重复筛 |
| 卡片字段 | 大图 + @作者 + 点赞 + 模拟角标 | 模拟名 + 参数一行 + 机型 | 作品格 / 配方参数表 | P0 可读参数；P1 组 vs 单卡 |
| 主 CTA | 存配方 / 收藏 | 写入相机 | 应用配方 / 分析作品 | P0 写机闭环 |
| 配方组 | 横滑合集 + 数量角标 | 相机槽位 C1–C3 | 仅配方轨 | P0 组与单卡分层 |

## 方案取舍建议

- **A**：保留社区增长与 UGC 氛围，需强化卡片上的 Recipe 元数据，避免纯图库。
- **B**：最贴「工具 + 资产」心智，适合写机/同步为核心卖点的 Fuji 预设 App。
- **C**：解决「样张 vs 参数」混排；适合内容量大、需 Recipe Analyser 类能力的路线。

## 选定方向 · 影像驱动的暗房工作台

在 A/B/C/D 探索之后，不再继续平铺第四套模板，而是收敛为一个可交付方向：

- **品类与主任务**：摄影配方社区；发现可信样张，并把配方写入已连接的相机。
- **首屏主角**：一张编辑精选样张和“写入相机”主动作。
- **设计特异性**：相机连接态、兼容机型、C1–C3 槽位、覆盖确认和写入反馈只能属于摄影配方产品。
- **视觉语言**：深色暗房画布、影像优先、克制的青色操作反馈；青色不再作为导入次数等普通元数据颜色。
- **内容真实性**：首屏不同实体不复用同一张图；缺少照片时使用明确的色板表达，不伪装成另一位创作者的样张。
- **记忆点**：从配方页直接选择相机槽位，完成覆盖确认、写入进度与成功反馈。

### 已完成主流程

```text
浏览精选 → 收藏 → 写入相机 → 选择 C 槽位
    → 空槽直接写入 / 已占用槽确认覆盖
    → 写入进度 → 成功 → 相机状态回写
```

### 质量门禁

- 所有主要控制至少 44 × 44pt；
- 筛选、收藏和选中态真实更新，不使用 Toast 代替主任务；
- 375×812 保持单栏；466×678 使用侧栏；890×626 使用主从双栏；
- 运行截图：
  - `exports/selected-quality-direction-375.png`
  - `exports/selected-quality-direction-466.png`
  - `exports/selected-quality-direction-890.png`
  - `exports/selected-quality-write-slots-375.png`
  - `exports/selected-quality-write-success-375.png`
- 独立审查发现的重复素材、Toast-only 主流程、触控尺寸和宽屏缺失已在选定方向中修正。

## kitGap

- `PrototypeRecipeMasonryCard`：瀑布流配方卡（含参数摘要条）
- `PrototypeCameraSlotRow`：机身 C 位槽位
- `PrototypeRecipeParamGrid`：详情级参数摘要网格
- `PrototypeRecipeQualityWorkbench`：影像驱动的发现页与 Duo 主从布局
- `PrototypeCameraSlotWriter`：相机槽位选择、覆盖确认、写入进度与成功状态
