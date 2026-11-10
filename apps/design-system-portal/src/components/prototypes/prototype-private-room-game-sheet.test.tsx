import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrototypePrivateRoomGameSheet } from "./prototype-private-room-game-sheet";

const games = [
  {
    name: "Jackaroo",
    image: "/prototypes/toptop-home/game-jackaroo-v2.png",
  },
  {
    name: "Carrom",
    image: "/prototypes/toptop-home/game-carrom-v2.png",
  },
] as const;

describe("PrototypePrivateRoomGameSheet", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("requires a game before creating the private room", () => {
    const onCreateRoom = vi.fn();
    const onDismiss = vi.fn();
    const { container } = render(
      <PrototypePrivateRoomGameSheet
        open
        games={games}
        onDismiss={onDismiss}
        onCreateRoom={onCreateRoom}
      />,
    );

    const navigation = screen.getByRole("navigation", {
      name: "Private room game selection",
    });
    expect(navigation).toHaveTextContent("Choose a game");
    expect(navigation).toHaveTextContent(
      "Pick one game to start a private room.",
    );
    expect(
      container.querySelector(".prototypePrivateRoomHandle"),
    ).not.toBeInTheDocument();

    const start = screen.getByRole("button", { name: "Start private room" });
    expect(start).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Select Jackaroo" }));
    expect(start).toBeEnabled();

    fireEvent.click(start);
    expect(onCreateRoom).toHaveBeenCalledWith(games[0]);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("supports backdrop and Escape dismissal", () => {
    const onDismiss = vi.fn();
    render(
      <PrototypePrivateRoomGameSheet
        open
        games={games}
        onDismiss={onDismiss}
        onCreateRoom={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss game selection" }),
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it("keeps the sheet mounted until exit motion completes", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(
      <PrototypePrivateRoomGameSheet
        open
        games={games}
        onDismiss={vi.fn()}
        onCreateRoom={vi.fn()}
      />,
    );

    rerender(
      <PrototypePrivateRoomGameSheet
        open={false}
        games={games}
        onDismiss={vi.fn()}
        onCreateRoom={vi.fn()}
      />,
    );

    expect(
      container.querySelector(".prototypePrivateRoomOverlay"),
    ).toHaveAttribute("data-state", "exit");

    act(() => vi.advanceTimersByTime(200));
    expect(
      container.querySelector(".prototypePrivateRoomOverlay"),
    ).not.toBeInTheDocument();
  });
});
