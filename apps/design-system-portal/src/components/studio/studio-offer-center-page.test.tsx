import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudioOfferCenterPage } from "./studio-offer-center-page";

describe("StudioOfferCenterPage", () => {
  it("prioritizes current progress, next goal and milestone states", () => {
    render(<StudioOfferCenterPage />);

    expect(screen.getByText("$12.00 / $30.00")).toBeInTheDocument();
    expect(
      screen.getByText("Recharge $8.00 more to unlock 225,000 coins"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", {
        name: "Monthly offer recharge progress",
      }),
    ).toHaveAttribute("aria-valuenow", "12");
    expect(screen.getByText("1/3 claimed")).toBeInTheDocument();
    expect(
      screen
        .getByRole("button", { name: "Recharge to unlock $20 reward" })
        .closest(".studioOfferScroll"),
    ).toBeNull();
  });

  it("recharges, unlocks and claims the next reward", () => {
    render(<StudioOfferCenterPage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Recharge to unlock $20 reward",
      }),
    );
    const sheet = screen.getByRole("dialog", { name: "My coins" });
    expect(within(sheet).getByText("3,432")).toBeInTheDocument();
    fireEvent.click(
      within(sheet).getByRole("button", { name: "Recharge $9.99" }),
    );

    expect(
      screen.getByText("Recharge successful · $20 reward unlocked"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Claim" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("225,000 coins");
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Galaxy frame · 30 days",
    );
  });

  it("switches offers, activates an available offer and opens history", () => {
    const onBack = vi.fn();
    render(<StudioOfferCenterPage onBack={onBack} />);

    fireEvent.click(screen.getByRole("tab", { name: "Available" }));
    expect(screen.getByText("VIP Experience Offer")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Activate" })[0]);
    expect(
      screen.getByText("VIP Experience Offer activated"),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Active" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    const historyButton = screen.getByRole("button", { name: "History" });
    expect(
      historyButton.querySelector('[data-system-icon="history"]'),
    ).toBeInTheDocument();
    fireEvent.click(historyButton);
    expect(
      screen.getByRole("heading", { name: "Offer history" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Your previous offers")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "返回" }));
    fireEvent.click(screen.getByRole("button", { name: "返回" }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
