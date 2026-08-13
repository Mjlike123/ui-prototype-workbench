# Portal 外网部署边界

Design System Portal 可以部署到外网，作为人和本地 Agent 共用的只读 Kit。它不托管 Cursor 模型，也不接收用户的 Cursor 凭据。

## 外网提供

- Foundations、组件契约、交互规范和参考预览
- `GET /api/catalog` 结构化 Kit 目录
- Agent 协作入门与 Skill 组合
- 页面 Manifest、截图参考和验收说明
- Git 版本对应的组件生命周期与覆盖状态

## 保持本地

- Cursor 等 Agent IDE 的推理和代码修改
- `Lookin.app`、USB 设备连接与 iOS 运行时采集
- 本地 Figma Token 或其他私密 API Key
- 未公开的产品图片、用户截图和业务数据

## 部署方式

Portal 当前是 Next.js 应用，包含静态页面和少量动态 Route Handler，应部署为 Node/Serverless 应用，而不是纯静态文件：

```bash
npm install
npm run specs:validate
npm run portal:test
npm run portal:build
```

生产环境启动方式由目标平台提供。Vercel、支持 Next.js 的 Serverless 平台或容器化 Node 服务均可。

## 环境隔离

- `/audit` 的 Lookin 服务仍指向访问者本机 `127.0.0.1:4317`，外网 Portal 不代理该流量。
- 未启动本地审计服务时，Portal 的组件文档、预览和 Catalog 仍应可用。
- 私有 Kit 应在公司网关或单点登录之后发布；公开 Kit 不应包含内部 Figma Token、用户截图或专有资源。

## 发布门禁

```bash
npm run check:kit
npm run portal:build
```

发布版本应记录：

- Git commit
- `skill/manifest.json` 版本
- Spec 校验结果
- Skill 文档漂移校验结果

## Cursor 使用方式

外网用户打开 `/getting-started`，查看组件和 Skill 菜谱；随后在自己的本地 Cursor 中安装或读取 Kit，并在目标代码库里生成原型。Portal 不承担模型费用，也不保证用户本地 Agent 的输出，最终结果必须经过 Skills 和项目测试验收。
