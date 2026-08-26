import { afterEach, describe, expect, it } from "vitest";
import {
  appendPublishedFeedPost,
  clearFeedComposeDraft,
  createPublishedFeedPost,
  extractFeedHashtags,
  loadFeedComposeDraft,
  readPublishedFeedPosts,
  saveFeedComposeDraft,
} from "./feed-compose-session";

describe("feed-compose-session", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("persists and clears compose drafts", () => {
    saveFeedComposeDraft({
      caption: "Hello",
      media: ["/photo.png"],
      audience: "friends",
    });
    expect(loadFeedComposeDraft()?.caption).toBe("Hello");

    clearFeedComposeDraft();
    expect(loadFeedComposeDraft()).toBeNull();
  });

  it("extracts hashtags and stores published posts", () => {
    expect(extractFeedHashtags("Late night #OOTD swim")).toEqual(["#OOTD"]);

    const post = createPublishedFeedPost({
      caption: "New #OOTD",
      media: ["/prototypes/feed/latifa-photo.png"],
    });
    appendPublishedFeedPost(post);

    expect(readPublishedFeedPosts()[0]?.caption).toBe("New #OOTD");
  });
});
