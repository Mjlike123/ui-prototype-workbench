"use client";

import { useEffect, useRef, useState } from "react";

export function AuditLauncher({ serviceOnline }: { serviceOnline: boolean }) {
  const [showFallback, setShowFallback] = useState(false);
  const fallbackTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (fallbackTimer.current !== undefined) {
        window.clearTimeout(fallbackTimer.current);
      }
    },
    [],
  );

  const handleLaunch = () => {
    setShowFallback(false);
    fallbackTimer.current = window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        setShowFallback(true);
      }
    }, 1200);
  };

  return (
    <div className="auditLaunchPrompt">
      <div>
        <strong>
          {serviceOnline ? "下一步：打开 Lookin" : "先启动本地审计服务"}
        </strong>
        <p className="panelDescription">
          {serviceOnline
            ? "Lookin 会读取当前 Kit Profile；连接设备并选择模块后即可验收。"
            : "运行 npm run ui，刷新本页确认服务在线后再打开 Lookin。"}
        </p>
      </div>
      {serviceOnline ? (
        <a
          className="button buttonPrimary"
          href="lookin-audit://open"
          onClick={handleLaunch}
        >
          打开 Lookin
        </a>
      ) : (
        <button className="button buttonSecondary" type="button" disabled>
          等待审计服务
        </button>
      )}
      {showFallback && (
        <p className="auditLaunchFallback" role="status">
          没有自动打开？先运行 <code>npm run lookin:open</code> 注册本地应用，然后重试。
        </p>
      )}
    </div>
  );
}
