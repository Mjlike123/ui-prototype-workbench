import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MotionTokenPreview } from "./motion-token-preview";

describe("MotionTokenPreview", () => {
  it("renders instant press feedback demo", () => {
    render(<MotionTokenPreview tokenId="motion.duration.instant" />);
    expect(
      screen.getByRole("button", { name: "点击感受颜色反馈" }),
    ).toBeInTheDocument();
  });

  it("activates instant press state on click", () => {
    const { container } = render(
      <MotionTokenPreview tokenId="motion.duration.instant" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "点击感受颜色反馈" }));
    expect(
      container.querySelector(".motionTokenInstantTarget--active"),
    ).toBeTruthy();
  });

  it("renders easing comparison between standard and spring", () => {
    render(<MotionTokenPreview tokenId="motion.easing.standard" />);
    expect(screen.getByText("standard")).toBeInTheDocument();
    expect(screen.getByText("spring")).toBeInTheDocument();
  });

  it("renders spring overshoot demo", () => {
    render(<MotionTokenPreview tokenId="motion.spring.standard" />);
    expect(
      screen.getByRole("button", { name: "点击观察 overshoot 回弹" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/stiffness 300/)).toBeInTheDocument();
  });
});
