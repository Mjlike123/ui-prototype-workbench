import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuditLauncher } from "./audit-launcher";

afterEach(() => {
  vi.useRealTimers();
});

describe("AuditLauncher", () => {
  it("blocks Lookin launch until the audit service is online", () => {
    render(<AuditLauncher serviceOnline={false} />);

    expect(
      screen.getByRole("button", { name: "等待审计服务" }),
    ).toBeDisabled();
    expect(screen.queryByRole("link", { name: "打开 Lookin" })).toBeNull();
  });

  it("launches the Lookin protocol and offers a local fallback", () => {
    vi.useFakeTimers();
    render(<AuditLauncher serviceOnline />);

    const launchLink = screen.getByRole("link", { name: "打开 Lookin" });
    expect(launchLink).toHaveAttribute("href", "lookin-audit://open");

    launchLink.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(launchLink);
    act(() => vi.advanceTimersByTime(1200));

    expect(screen.getByRole("status")).toHaveTextContent(
      "npm run lookin:open",
    );
  });
});
