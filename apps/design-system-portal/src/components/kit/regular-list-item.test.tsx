import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RegularListItem } from "./regular-list-item";

describe("RegularListItem", () => {
  it("renders message content in list order and handles row press", () => {
    const onPress = vi.fn();
    render(
      <div role="list">
        <RegularListItem
          listType="message"
          title="Cassie"
          subtitle="TOP 827419"
          leading={<span>Avatar</span>}
          tags={<span>V10</span>}
          onPress={onPress}
        />
      </div>,
    );

    expect(screen.getByRole("listitem")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Cassie，TOP 827419" }),
    );
    expect(onPress).toHaveBeenCalledOnce();
  });
});
