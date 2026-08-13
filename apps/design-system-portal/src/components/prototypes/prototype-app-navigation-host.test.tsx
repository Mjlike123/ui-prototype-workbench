import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { PrototypeAppNavigationHost } from "./prototype-app-navigation-host";

function StatefulSearchPane() {
  const [value, setValue] = useState("");
  return (
    <input
      aria-label="Search"
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
    />
  );
}

describe("PrototypeAppNavigationHost", () => {
  it("preserves the destination pane when the transition completes", () => {
    const onTransitionEnd = vi.fn();
    const { rerender } = render(
      <PrototypeAppNavigationHost
        phase="push"
        activeKey="home"
        fromKey="home"
        toKey="search"
        durationMs={320}
        onTransitionEnd={onTransitionEnd}
        fromPane={<div>Home</div>}
        toPane={<StatefulSearchPane />}
      >
        <div>Home</div>
      </PrototypeAppNavigationHost>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Search" }), {
      target: { value: "Cassie" },
    });
    rerender(
      <PrototypeAppNavigationHost
        phase="idle"
        activeKey="search"
        durationMs={320}
        onTransitionEnd={onTransitionEnd}
        fromPane={null}
        toPane={null}
      >
        <StatefulSearchPane />
      </PrototypeAppNavigationHost>,
    );

    expect(screen.getByRole("textbox", { name: "Search" })).toHaveValue(
      "Cassie",
    );
  });
});
