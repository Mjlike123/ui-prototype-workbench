# PAG Web 动画接入

Portal 使用官方 `libpag` Web SDK。WASM 固定从
`/vendor/libpag/libpag.wasm` 加载，动画图标文件统一放在
`apps/design-system-portal/public/icons/animated/`。

```tsx
<PagIcon
  src="/icons/animated/profile-mini-card-room.pag"
  size={20}
  fallback={<SystemIcon name="voiceStatus" size={20} />}
/>
```

`PagIcon` 默认循环播放，并在页面隐藏或元素离开视口后暂停。系统开启“减少动态效果”时只显示首帧。加载失败时保留静态 fallback；组件卸载时会释放 `PAGView` 和 `PAGFile` 的 WASM 资源。

同一页面避免同时播放多个 PAG 实例。PAG Web 为单线程实现，且浏览器 WebGL Context 数量有限；列表场景应优先使用静态图标，仅为当前可见、确有业务意义的状态播放动画。
