import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TextButton } from "./text-button";

describe("TextButton", () => {
  it("fires onPress and applies size and appearance classes", () => {
    const onPress = vi.fn();
    render(
      <TextButton
        label="文字+icon"
        size="size14"
        appearance="brand"
        iconPosition="trailing"
        trailingPreset="chevron"
        onPress={onPress}
      />,
    );

    const button = screen.getByRole("button", { name: "文字+icon" });
    expect(button).toHaveClass(
      "kitTextButton--size14",
      "kitTextButton--brand",
    );
    expect(button.querySelector(".kitTextButtonChevron")).toBeInTheDocument();

    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("respects disabled and neutral secondary emphasis", () => {
    render(
      <TextButton
        label="禁用"
        appearance="neutral"
        emphasis="secondary"
        disabled
      />,
    );

    const button = screen.getByRole("button", { name: "禁用" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      "kitTextButton--neutral",
      "kitTextButton--secondary",
      "kitTextButton--disabled",
    );
  });

  it("renders a leading system icon when configured", () => {
    render(
      <TextButton
        label="礼物"
        iconPosition="leading"
        leadingIcon="gift"
        onPress={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: "礼物" });
    expect(button.querySelector('[data-system-icon="gift"]')).toBeInTheDocument();
  });
});
