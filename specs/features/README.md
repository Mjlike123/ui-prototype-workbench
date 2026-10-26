# Feature interaction specs

由 `toptop-ix-designer` 在用户确认后写入：

```text
specs/features/{feature-id}/
  brief.yaml          # 需求简报
  interaction.yaml    # 交互契约
  design-doc.md       # UX 设计说明
  ux-review.yaml      # 可选审查记录
  wireframes/         # 可选黑白稿导出
```

草稿迭代目录：`.monkren/ix-design/{feature-id}-{YYYY-MM-DD}/`

通用 Schema：`.agents/skills/ix-designer-core/specs/`

`toptop-ix-designer/specs/` 暂保留 v1 兼容副本；新业务与新工具应引用 Core Schema。
