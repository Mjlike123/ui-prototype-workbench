import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudioReportReasonPage } from "./studio-report-reason-page";

afterEach(() => {
  vi.useRealTimers();
});

describe("StudioReportReasonPage", () => {
  it("uses one accessible reason group and enables submit after selection", () => {
    render(<StudioReportReasonPage />);

    const submit = screen.getByRole("button", { name: "Submit report" });
    expect(submit).toBeDisabled();
    expect(
      screen.queryByRole("radio", { name: "Under age user" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Harassment" }));

    expect(screen.getByRole("radio", { name: "Harassment" })).toBeChecked();
    expect(submit).toBeEnabled();
  });

  it("keeps Other separate from the optional description and requires its text", () => {
    render(<StudioReportReasonPage />);

    fireEvent.click(screen.getByRole("radio", { name: "Other" }));
    const otherField = screen.getByRole("textbox", {
      name: /Tell us what happened/,
    });
    const description = screen.getByRole("textbox", {
      name: /Violation description/,
    });

    expect(otherField).toHaveAttribute("maxlength", "100");
    expect(description).toHaveAttribute("maxlength", "200");
    expect(
      screen.getByRole("button", { name: "Submit report" }),
    ).toBeDisabled();

    fireEvent.change(otherField, {
      target: { value: "Repeated room stalking" },
    });
    expect(screen.getByRole("button", { name: "Submit report" })).toBeEnabled();
  });

  it("requires a profile type and explains automatic evidence submission", () => {
    render(<StudioReportReasonPage />);

    fireEvent.click(screen.getByRole("tab", { name: "Profile" }));
    expect(
      screen.getByText(
        "We’ll submit the profile details you select as evidence for review.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Harassment" }));
    expect(
      screen.getByRole("button", { name: "Submit report" }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox", { name: "Avatar" }));
    expect(screen.getByRole("button", { name: "Submit report" })).toBeEnabled();
  });

  it("shows the FR-only reason and supports optional evidence", () => {
    render(<StudioReportReasonPage />);

    fireEvent.click(screen.getByRole("checkbox", { name: "FR region" }));
    expect(
      screen.getByRole("radio", { name: "Under age user" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add evidence" }));
    expect(screen.getByText("evidence.png")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Remove evidence.png" }),
    );
    expect(screen.queryByText("evidence.png")).not.toBeInTheDocument();
  });

  it("shows progress, confirms success and preserves data on failure", () => {
    vi.useFakeTimers();
    const { unmount } = render(<StudioReportReasonPage />);

    fireEvent.click(screen.getByRole("radio", { name: "Harassment" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit report" }));
    expect(screen.getByText("Submitting report")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(720));
    expect(screen.getByText("Report submitted")).toBeInTheDocument();

    unmount();
    render(<StudioReportReasonPage />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Simulate error" }));
    fireEvent.click(screen.getByRole("radio", { name: "Harassment" }));
    const description = screen.getByRole("textbox", {
      name: /Violation description/,
    });
    fireEvent.change(description, { target: { value: "Supporting context" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit report" }));
    act(() => vi.advanceTimersByTime(720));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your details are saved",
    );
    expect(description).toHaveValue("Supporting context");
    expect(screen.getByRole("radio", { name: "Harassment" })).toBeChecked();
  });

  it("reports the navigation exit to the host", () => {
    const onBack = vi.fn();
    render(<StudioReportReasonPage onBack={onBack} />);

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onBack).toHaveBeenCalledTimes(2);
  });
});
