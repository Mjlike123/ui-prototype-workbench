import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FeedPublishStatusHost } from "./feed-publish-status-host";
import { readPublishedFeedPosts } from "@/lib/feed-compose-session";
import {
  beginFeedPublish,
  readFeedPublishJob,
} from "@/lib/feed-publish-status";

describe("FeedPublishStatusHost", () => {
  afterEach(() => {
    window.sessionStorage.clear();
    vi.useRealTimers();
  });

  it("shows uploading then success below feed after publish starts", async () => {
    vi.useFakeTimers();
    beginFeedPublish({
      caption: "Late night swim #OOTD",
      media: ["/prototypes/feed/latifa-photo.png"],
    });

    render(<FeedPublishStatusHost />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByRole("status", { name: "uploading..." }))
      .toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(900);
    });
    expect(screen.getByRole("status", { name: "发布成功！" }))
      .toBeInTheDocument();
    expect(readPublishedFeedPosts()[0]?.caption).toBe("Late night swim #OOTD");

    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    expect(readFeedPublishJob()).toBeNull();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
