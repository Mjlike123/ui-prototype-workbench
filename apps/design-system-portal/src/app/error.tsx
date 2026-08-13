"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="panel emptyState" role="alert">
      <div>
        <h2>规范内容加载失败</h2>
        <p>
          YAML 或 Schema 可能存在无效内容。请先运行 npm run
          specs:validate 检查。
        </p>
        <div className="buttonRow" style={{ justifyContent: "center", marginTop: 16 }}>
          <button
            className="button buttonPrimary"
            type="button"
            onClick={reset}
          >
            重新加载
          </button>
        </div>
      </div>
    </div>
  );
}
