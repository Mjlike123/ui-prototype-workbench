import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IosStatusBar } from "./ios-status-bar";

describe("IosStatusBar", () => {
  it("renders black and white system assets", () => {
    const { container, rerender } = render(
      <IosStatusBar appearance="dark-content" />,
    );

    expect(container.querySelector(".iosStatusBar")).toHaveClass(
      "iosStatusBar--dark-content",
    );
    expect(
      container.querySelector('img[src*="ios状态栏信号-黑.svg"]'),
    ).not.toBeNull();

    rerender(<IosStatusBar appearance="light-content" time="10:08" />);
    expect(container.querySelector(".iosStatusBar")).toHaveClass(
      "iosStatusBar--light-content",
    );
    expect(container.querySelector("time")).toHaveTextContent("10:08");
  });
});
