import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  RegularListItem,
  RegularListLeadingIcon,
} from "./regular-list-item";

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

  it("keeps the semantic icon at 24px inside a 48px solid leading surface", () => {
    const { container } = render(
      <div role="list">
        <RegularListItem
          listType="action"
          surface="canvas"
          title="Invite TopTop friends"
          subtitle="Browse your friends"
          leading={<RegularListLeadingIcon icon="person" />}
          onPress={() => undefined}
        />
      </div>,
    );

    expect(screen.getByRole("listitem")).toHaveClass(
      "regularListItem--canvas",
    );
    expect(container.querySelector(".regularListLeadingIcon")).not.toBeNull();
    expect(
      container.querySelector('[data-system-icon="person"]'),
    ).toHaveStyle({ width: "24px", height: "24px" });
  });
});
