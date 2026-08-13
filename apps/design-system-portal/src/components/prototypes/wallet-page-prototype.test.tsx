import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WalletPagePrototype } from "./wallet-page-prototype";

describe("WalletPagePrototype", () => {
  it("shows my coins balance and sku tiers", () => {
    const onBack = vi.fn();
    render(<WalletPagePrototype onBack={onBack} />);

    expect(screen.getAllByText("My coins").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("12,580")).toBeInTheDocument();
    expect(screen.getByText("Buy coins")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /购买 600 coins/ })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Get coins" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "返回" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("opens system purchase when tapping a sku", () => {
    render(<WalletPagePrototype onBack={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: /购买 1,200 coins.*\$19\.99/ }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "跳转系统购买 · 1,200 coins · $19.99",
    );
  });
});
