"use client";

import { useEffect } from "react";

/** Loads Figma html-to-design capture when URL hash includes figmacapture=. */
export function FigmaCaptureBootstrap() {
  useEffect(() => {
    if (!window.location.hash.includes("figmacapture=")) {
      return;
    }
    if (document.querySelector("script[data-figma-capture]")) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://mcp.figma.com/mcp/html-to-design/capture.js";
    script.async = true;
    script.dataset.figmaCapture = "true";
    document.head.appendChild(script);
  }, []);

  return null;
}
