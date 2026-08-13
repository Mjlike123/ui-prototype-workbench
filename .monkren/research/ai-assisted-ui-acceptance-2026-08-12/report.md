# AI 辅助 UI 走查与验收：全球实践研究

研究日期：2026-08-12

## 摘要与建议

结论不是“AI 辅助 UI 验收这条路不成立”，而是“以整页像素对比为主线不成立”。

全球成熟实践把 UI 质量拆成多种证据：

1. 功能与状态通过语义化 UI 自动化执行动作并断言结果。
2. 视觉回归在稳定环境、明确状态、固定视口和受控区域内运行。
3. 动态内容通过 DOM 元素、Ignore/Layout/Dynamic 区域和测试数据稳定化处理。
4. 可用性与体验仍依赖代表性用户完成真实任务。
5. AI 用于规划、探索、聚类和生成问题草稿，但必须允许人工纠正、忽略和最终确认。

对当前项目的建议：

- 将主产品从“AI 像素验收工具”调整为“场景化验收与证据工作台”。
- 保留视觉走查，但降为某个场景步骤中的局部证据工具。
- 暂停继续投入“任意设计稿与任意真机截图的整页智能像素匹配”。
- 下一阶段优先建设角色、账号、测试数据、场景步骤、状态矩阵、操作记录和证据归档。

## 当前状态

当前视觉走查工作台已经具备双图上传、标注、平铺、透明叠加和导出，但核心仍是截图像素差异。真实业务页面中的照片、头像、时间、用户数据、字体渲染、设备密度和宽屏重排会制造大量噪声；同时，截图无法证明增删改查、权限、错误恢复和跨状态行为是否正确。

## 研究范围与证据限制

本研究优先采用国际标准、官方平台文档和成熟测试产品文档。商业厂商对自身 AI 能力的描述属于产品主张，不视为独立实验结论；但可用于判断行业实现所需的工程前提。

## 稳定模式

### 1. 视觉回归成立的前提是可重复环境，而不是任意截图

Playwright 官方明确警告：操作系统、版本、设置、硬件、电源状态和 headless 模式都会影响浏览器渲染；基线必须在同一环境生成。其视觉比较本质仍使用 pixelmatch，并提供样式注入来隐藏动态或易变元素。

启示：设计稿导出图与真实测试机截图通常不满足同环境、同字体、同数据、同渲染管线条件，不能直接当作稳定的自动门禁。

### 2. 成熟视觉工具采用“状态 + 区域 + 语义”，不是只提高像素算法

Chromatic 将视觉测试建立在 Storybook 状态、浏览器、视口、主题和交互测试之上，并提供忽略元素、稳定截图、响应式视口和人工 Review。

Applitools 明确表示 Exact 像素模式不适合普通验证。其 Layout、Dynamic、Ignore Colors、Floating 和 Ignore Regions 可以按页面区域混合；Web 动态匹配默认依赖 DOM，官方推荐元素绑定区域而不是固定坐标。

启示：AI 视觉对比可以有价值，但前提是页面可被测试框架控制，并具备 DOM/组件语义、固定状态和区域策略。它不是“上传两张任意图片即可验收”。

### 3. UI 验收首先是行为和状态验证

Apple XCUITest 使用 Accessibility 语义查询 UI 元素、合成点击等事件，并断言元素属性与状态。Android Compose 测试同样通过 Semantics 查找节点、执行点击/输入并验证属性，同时强调设备测试和不同屏幕尺寸。

启示：角色权限、增删改查、错误提示和状态变化需要“查找元素 → 执行动作 → 断言结果”，截图只能作为失败附件或视觉检查点。

### 4. 软件验收不能被缩减成视觉质量

ISO/IEC 25010:2023 的产品质量模型包含九类特征，并明确用于定义测试目标与验收标准。功能适合性、交互能力、可靠性、安全性、兼容性等都不是截图对比能够覆盖的。

启示：验收中心应以需求与风险组织证据，而不是以“视觉差异数量”组织结论。

### 5. 可用性验证依赖代表性用户和真实任务

Nielsen Norman Group 建议使用代表性参与者完成与研究目标匹配的场景任务，并以任务成功率、错误率、完成时间和满意度等指标判断。过度提示会把可用性研究变成“找词游戏”。

启示：AI 可以扮演自动探索者或测试助手，但不能替代真实用户的理解、犹豫、误解和情境行为。

### 6. 自动化需要分层，AI 需要可纠正

Google 的测试工程实践强调窄范围测试应占主体，端到端测试用于少量关键系统行为，因为其更慢、更不稳定且更难诊断。

Microsoft 的 Human-AI Interaction Guidelines 要求说明 AI 能做什么、做得多好，并支持高效忽略、纠正和在不确定时降级。

启示：AI 不应输出一个不可质疑的“验收通过率”。它应提供证据、置信度、原因和人工纠正入口。

## 模式与反模式

### 建议采用

- 需求驱动的角色 × 场景 × 状态矩阵。
- Web 使用 DOM/ARIA，iOS 使用 Accessibility identifiers，Android 使用 Semantics/Test tags。
- 每个步骤记录动作、预期、实际结果、日志、接口、截图和环境。
- 稳定组件在固定状态与视口下做视觉回归。
- 动态图片与业务数据使用 Layout/Dynamic/Ignore 区域。
- AI 生成测试草案、探索遗漏状态、归并证据、起草问题；规则和断言负责确定性判断。
- 人工对主观设计质量、体验和高风险结果做最终确认。

### 应避免

- 任意设计稿与任意真机截图直接整页像素评分。
- 从截图反推代码实际使用的 Token、权限逻辑或自适应约束。
- 把照片、头像内容和动态数据差异当成 UI 缺陷。
- 用 AI 单一分数替代需求验收、自动化断言和人工判断。
- 让大量端到端 AI 探索替代单元、组件和接口测试。

## 对当前项目的应用

### 推荐产品结构

1. 验收项目：版本、环境、需求、负责人。
2. 角色与测试数据：账号、权限、前置数据、设备。
3. 验收场景：目标、步骤、预期状态、风险等级。
4. 执行器：人工辅助、Playwright、XCUITest、Android UI Test。
5. 证据：DOM/语义树、网络、日志、截图、视频、视觉检查点。
6. AI 审阅：遗漏状态、异常聚类、问题草稿、置信度。
7. 人工签署：确认、驳回、纠正、豁免与责任人。

### 视觉能力的新边界

- 组件级：稳定状态下的字体、颜色、图标、边距和尺寸回归。
- 页面级：关键区域和布局锚点，不比较动态内容本身。
- 响应式：在预定义视口分别建立期望，不跨设备直接缩放同一基线。
- 真机截图：主要作为场景证据；只有具备元素映射或手动区域时才做局部视觉检查。
- Token 合规：读取 DOM/CSS、Figma variables 或原生运行时属性，不从像素猜 Token 名称。

### 推荐下一步

停止 P2“整页宽屏像素智能匹配”，改做一个场景验收 MVP：

- 输入项目需求、角色、账号和测试环境。
- AI 生成可编辑的场景与状态矩阵。
- 操作者按步骤执行，系统记录动作和证据。
- Web 首先接入 Playwright；iOS/Android 沿用平台语义自动化。
- 场景中允许插入“局部视觉检查点”，复用现有视觉走查画布。
- 输出按场景组织的问题清单，而不是按像素区域组织。

## 来源

1. [Playwright — Visual comparisons](https://playwright.dev/docs/test-snapshots)
2. [W3C WAI — Selecting Web Accessibility Evaluation Tools](https://www.w3.org/WAI/test-evaluate/tools/selecting/)
3. [ISO/IEC 25010:2023 — Product quality model](https://www.iso.org/standard/78176.html)
4. [Software Engineering at Google — Testing Overview](https://abseil.io/resources/swe-book/html/ch11.html)
5. [Chromatic documentation](https://www.chromatic.com/docs/)
6. [Applitools — Match Levels and Regions](https://applitools.com/docs/eyes/concepts/best-practices/match-levels)
7. [Apple — User Interface Testing](https://developer.apple.com/library/archive/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/09-ui_testing.html)
8. [Android Developers — Test your Compose layout](https://developer.android.com/develop/ui/compose/testing)
9. [Microsoft Research — Guidelines for human-AI interaction design](https://www.microsoft.com/en-us/research/blog/guidelines-for-human-ai-interaction-design/)
10. [Nielsen Norman Group — Checklist for Planning Usability Studies](https://www.nngroup.com/articles/usability-test-checklist/)
