"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { getPagRuntime } from "@/lib/pag-runtime";

type PagIconState = "loading" | "ready" | "error";

export function PagIcon({
  src,
  size = 24,
  repeatCount = 0,
  autoPlay = true,
  className,
  fallback,
  ariaLabel,
  onError,
}: {
  src: string;
  size?: number;
  repeatCount?: number;
  autoPlay?: boolean;
  className?: string;
  fallback?: ReactNode;
  ariaLabel?: string;
  onError?: (error: Error) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onErrorRef = useRef(onError);
  const [state, setState] = useState<PagIconState>("loading");

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasElement = canvas;

    const controller = new AbortController();
    let disposed = false;
    let isVisible = true;
    let observer: IntersectionObserver | null = null;
    let pagFile: Awaited<
      ReturnType<
        Awaited<ReturnType<typeof getPagRuntime>>["PAGFile"]["load"]
      >
    > | null = null;
    let pagView: Awaited<
      ReturnType<Awaited<ReturnType<typeof getPagRuntime>>["PAGView"]["init"]>
    > | null = null;

    const shouldReduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const syncPlayback = () => {
      if (!pagView || !autoPlay || shouldReduceMotion) return;
      if (isVisible && document.visibilityState !== "hidden") {
        void pagView.play();
      } else {
        pagView.pause();
      }
    };

    const handleVisibilityChange = () => syncPlayback();

    async function initialize() {
      try {
        setState("loading");
        const response = await fetch(src, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Unable to load PAG asset: ${response.status}`);
        }
        const [runtime, buffer] = await Promise.all([
          getPagRuntime(),
          response.arrayBuffer(),
        ]);
        if (disposed) return;

        pagFile = await runtime.PAGFile.load(buffer);
        if (disposed) {
          pagFile.destroy();
          pagFile = null;
          return;
        }

        pagView = await runtime.PAGView.init(pagFile, canvasElement, {
          firstFrame: true,
          useScale: true,
        });
        if (!pagView) throw new Error("Unable to create PAG view");
        if (disposed) {
          pagView.destroy();
          pagView = null;
          pagFile.destroy();
          pagFile = null;
          return;
        }

        pagView.setRepeatCount(repeatCount);
        setState("ready");

        if ("IntersectionObserver" in window) {
          isVisible = false;
          observer = new IntersectionObserver(([entry]) => {
            isVisible = entry?.isIntersecting ?? true;
            syncPlayback();
          });
          observer.observe(canvasElement);
        }
        document.addEventListener("visibilitychange", handleVisibilityChange);
        syncPlayback();
      } catch (cause) {
        if (disposed || controller.signal.aborted) return;
        const error =
          cause instanceof Error ? cause : new Error("Unable to play PAG asset");
        pagView?.destroy();
        pagView = null;
        pagFile?.destroy();
        pagFile = null;
        setState("error");
        onErrorRef.current?.(error);
      }
    }

    void initialize();

    return () => {
      disposed = true;
      controller.abort();
      observer?.disconnect();
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
      pagView?.destroy();
      pagFile?.destroy();
    };
  }, [autoPlay, repeatCount, src]);

  return (
    <span
      className={["pagIcon", className].filter(Boolean).join(" ")}
      data-pag-asset={src}
      data-pag-state={state}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      style={
        {
          "--pag-icon-size": `${size}px`,
        } as CSSProperties
      }
    >
      <canvas
        ref={canvasRef}
        className="pagIconCanvas"
        width={size}
        height={size}
        aria-hidden="true"
      />
      {state !== "ready" && fallback ? (
        <span className="pagIconFallback" aria-hidden="true">
          {fallback}
        </span>
      ) : null}
    </span>
  );
}
