export type FeedAlbumAsset = {
  id: string;
  src: string;
  label: string;
};

export const FEED_ALBUM_ASSETS: FeedAlbumAsset[] = [
  {
    id: "app-login-hero",
    src: "/prototypes/studio/app-login-hero.jpg",
    label: "TopTop character",
  },
  {
    id: "spin-bottle-booth",
    src: "/prototypes/studio/spin-bottle-booth.jpg",
    label: "Spin the bottle booth",
  },
  {
    id: "filmsim-recipes",
    src: "/prototypes/studio/filmsim-recipes-reference.jpg",
    label: "Film recipes",
  },
  {
    id: "character-share",
    src: "/prototypes/studio/character-share-hero-3d.png",
    label: "Character share",
  },
  {
    id: "moment-publish",
    src: "/prototypes/studio/moment-publish-detail.png",
    label: "Moment publish",
  },
  {
    id: "topic-discovery",
    src: "/prototypes/studio/topic-discovery.png",
    label: "Topic discovery",
  },
  {
    id: "report-reason",
    src: "/prototypes/studio/report-reason-optimization.png",
    label: "Report reason",
  },
  {
    id: "custom-emoji",
    src: "/prototypes/studio/im-custom-emoji.png",
    label: "Custom emoji",
  },
  {
    id: "offer-center",
    src: "/prototypes/studio/offer-center-optimization.png",
    label: "Offer center",
  },
  {
    id: "app-login-flow",
    src: "/prototypes/studio/app-login-flow.png",
    label: "App login flow",
  },
  {
    id: "character-impression",
    src: "/prototypes/studio/character-impression-share.png",
    label: "Character impression",
  },
  {
    id: "message-pin",
    src: "/prototypes/studio/message-conversation-pin.png",
    label: "Message pin",
  },
  {
    id: "spin-bottle",
    src: "/prototypes/studio/spin-bottle.png",
    label: "Spin the bottle",
  },
  {
    id: "live-room",
    src: "/prototypes/studio/live-room.png",
    label: "Live room",
  },
  {
    id: "voice-room-status",
    src: "/prototypes/studio/voice-room-status.png",
    label: "Voice room status",
  },
  {
    id: "feed-compose",
    src: "/prototypes/studio/feed-compose.png",
    label: "Feed compose",
  },
  {
    id: "search-flow",
    src: "/prototypes/studio/search-flow.png",
    label: "Search flow",
  },
];

/** Simulated camera capture result in prototype. */
export const FEED_CAMERA_CAPTURE = "/prototypes/message/conversation-4.png";

export function buildFeedAlbumGridAssets(
  count = FEED_ALBUM_ASSETS.length,
): FeedAlbumAsset[] {
  return Array.from({ length: count }, (_, index) => {
    const asset = FEED_ALBUM_ASSETS[index % FEED_ALBUM_ASSETS.length];
    return {
      ...asset,
      id: `${asset.id}-${index}`,
    };
  });
}
