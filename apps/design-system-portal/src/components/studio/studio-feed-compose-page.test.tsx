import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudioFeedComposePage } from "./studio-feed-compose-page";

describe("StudioFeedComposePage", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("uses studio layout shell separate from core compose", () => {
    render(<StudioFeedComposePage onBack={vi.fn()} />);

    expect(
      document.querySelector(".studioFeedComposeDevice"),
    ).toBeInTheDocument();
    expect(document.querySelector(".feedComposeDevice")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "New post" })).toBeInTheDocument();
  });
});
