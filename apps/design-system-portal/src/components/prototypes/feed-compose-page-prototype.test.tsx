import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FeedComposePagePrototype } from "./feed-compose-page-prototype";

describe("FeedComposePagePrototype", () => {
  it("requires content before posting and returns on back", () => {
    const onBack = vi.fn();
    render(<FeedComposePagePrototype onBack={onBack} />);

    expect(screen.getByRole("heading", { name: "New post" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "发布动态" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "返回" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("supports caption, photo, and publish feedback", () => {
    render(<FeedComposePagePrototype onBack={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("动态文案"), {
      target: { value: "Late night swim #OOTD" },
    });
    expect(screen.getByRole("button", { name: "发布动态" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "添加照片" }));
    expect(screen.getByLabelText("已选图片 1 张")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "发布动态" }));
    expect(screen.getByRole("status")).toHaveTextContent("动态已发布");
    expect(screen.getByLabelText("动态文案")).toHaveValue("");
  });

  it("toggles audience and inserts hashtags", () => {
    render(<FeedComposePagePrototype onBack={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: "可见范围：所有人" }),
    );
    expect(
      screen.getByRole("button", { name: "可见范围：好友" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "插入话题标签" }));
    expect(screen.getByLabelText("动态文案")).toHaveValue("#OOTD");
  });
});
