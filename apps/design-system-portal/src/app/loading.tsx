export default function Loading() {
  return (
    <div className="panel emptyState" aria-busy="true" aria-live="polite">
      <div>
        <span className="statusIndicator" style={{ display: "inline-block" }} />
        <h2 style={{ marginTop: 16 }}>正在加载规范</h2>
        <p>正在读取 YAML Contract、MDX 文档和覆盖状态…</p>
      </div>
    </div>
  );
}
