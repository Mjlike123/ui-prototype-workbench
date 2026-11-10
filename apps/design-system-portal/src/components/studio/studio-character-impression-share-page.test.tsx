import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudioCharacterImpressionSharePage } from "./studio-character-impression-share-page";

describe("StudioCharacterImpressionSharePage", () => {
  it("opens character code dialog and loads shared character", () => {
    render(<StudioCharacterImpressionSharePage />);

    fireEvent.click(screen.getByRole("button", { name: "Characters Code" }));
    const input = screen.getByRole("textbox", {
      name: /Please enter or paste character code/,
    });
    fireEvent.change(input, { target: { value: "32HU22PXCC" } });
    fireEvent.click(screen.getByRole("button", { name: "ok" }));

    expect(screen.getByRole("button", { name: "Use" })).toBeInTheDocument();
    expect(screen.getByText("32HU22PXCC")).toBeInTheDocument();
  });

  it("shows first-creation confirmation before generating", () => {
    render(<StudioCharacterImpressionSharePage />);

    fireEvent.click(screen.getByRole("button", { name: /Generate/ }));

    expect(screen.getByRole("dialog", { name: "仅首次创建免费" })).toBeVisible();
  });
});
