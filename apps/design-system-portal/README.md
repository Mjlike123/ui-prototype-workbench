# TopTop Design System Portal

团队内部只读 Design System Portal，用于查看视觉 Token、组件契约、React
参考实现、交互模式、多端映射和 Lookin 验收规则。

## 本地启动

从仓库根目录运行：

```bash
npm install
npm run portal:dev
```

默认打开 `http://localhost:3000`。若需要在验收中心显示本地服务状态，同时运行：

```bash
npm run ui
```

## 内容来源

- `specs/foundations/*.yaml`：视觉 Token。
- `specs/components/*.yaml`：组件契约和审计白名单。
- `specs/interactions/*.yaml`：状态、转换、反馈和异常路径。
- `specs/platform-mappings/*.yaml`：React/iOS/Android 映射。
- `content/**/*.mdx`：场景、指南、正反案例和迁移说明。
- `generated/figma/index.json`：Figma 同步缓存，不覆盖人工内容。

## 常用命令

```bash
npm run specs:validate
npm run figma:sync -- --dry-run
npm run portal:test
npm run portal:build
npm run portal:e2e
```

正式同步需要配置 `FIGMA_TOKEN`，也可通过现有
`~/.config/ui-audit/config.json` 提供 Token。

## 治理边界

首期不在 Portal 内编辑内容。所有变更通过 YAML/MDX、JSON Schema、Git
评审和自动测试发布；认证交给公司内网网关或部署平台。
