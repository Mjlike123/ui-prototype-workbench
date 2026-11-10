import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudioSocialSplashPage } from "./studio-social-splash-page";

describe("StudioSocialSplashPage", () => {
  it("renders the TopTop brand-core direction with Kit chrome", () => {
    const { container } = render(<StudioSocialSplashPage />);

    expect(
      screen.getByRole("heading", { name: "TopTop" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("TopTop is ready");
    expect(
      container.querySelector('[data-bottom-nav-icon="toptop"]'),
    ).toBeInTheDocument();
    expect(container.querySelector(".iosStatusBar")).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "A · 品牌核心" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("switches to the social-pulse direction with product status assets", () => {
    const { container } = render(<StudioSocialSplashPage />);

    fireEvent.click(screen.getByRole("tab", { name: "B · 好友信号" }));
    expect(
      container.querySelectorAll(".studioSocialSplashStatusIcon"),
    ).toHaveLength(3);
    expect(container.querySelector(".studioSocialSplashDevice")).toHaveAttribute(
      "data-scene",
      "social-pulse",
    );
  });

  it("supports the Duo inner viewport and a chrome-free type direction", () => {
    const { container } = render(
      <StudioSocialSplashPage
        width={890}
        height={626}
        initialScene="type-gate"
        hideSceneChrome
      />,
    );

    const shell = container.querySelector(".studioSocialSplashShell");
    const device = container.querySelector(".studioSocialSplashDevice");
    expect(shell).toHaveStyle({
      "--page-canvas-width": "890px",
      "--page-canvas-height": "626px",
    });
    expect(device).toHaveAttribute("data-scene", "type-gate");
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });
});
