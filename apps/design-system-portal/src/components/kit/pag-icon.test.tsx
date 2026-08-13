import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PagIcon } from "./pag-icon";

const { pagFile, pagView, getPagRuntime } = vi.hoisted(() => {
  const file = {
    destroy: vi.fn(),
  };
  const view = {
    destroy: vi.fn(),
    pause: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    setRepeatCount: vi.fn(),
  };
  return {
    pagFile: file,
    pagView: view,
    getPagRuntime: vi.fn().mockResolvedValue({
      PAGFile: {
        load: vi.fn().mockResolvedValue(file),
      },
      PAGView: {
        init: vi.fn().mockResolvedValue(view),
      },
    }),
  };
});

vi.mock("@/lib/pag-runtime", () => ({
  getPagRuntime,
}));

describe("PagIcon", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("loads and plays a PAG asset, then releases WASM resources", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      }),
    );
    const { container, unmount } = render(
      <PagIcon
        src="/animations/voice-status.pag"
        size={20}
        fallback={<span>Static icon</span>}
      />,
    );

    expect(screen.getByText("Static icon")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        container.querySelector('[data-pag-state="ready"]'),
      ).toBeInTheDocument(),
    );
    expect(pagView.setRepeatCount).toHaveBeenCalledWith(0);
    expect(pagView.play).toHaveBeenCalledOnce();
    expect(screen.queryByText("Static icon")).not.toBeInTheDocument();

    unmount();
    expect(pagView.destroy).toHaveBeenCalledOnce();
    expect(pagFile.destroy).toHaveBeenCalledOnce();
  });

  it("keeps the fallback visible when the asset cannot load", async () => {
    const onError = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );
    const { container } = render(
      <PagIcon
        src="/animations/missing.pag"
        fallback={<span>Static icon</span>}
        onError={onError}
      />,
    );

    await waitFor(() =>
      expect(
        container.querySelector('[data-pag-state="error"]'),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("Static icon")).toBeInTheDocument();
    expect(onError).toHaveBeenCalledOnce();
  });
});
