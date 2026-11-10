export const FEED_COMPOSE_CAPTURE_SCENES = [
  "empty",
  "filled",
  "photo-picker",
  "photo-picker-selected",
  "audience",
  "leave",
] as const;

export type FeedComposeCaptureScene =
  (typeof FEED_COMPOSE_CAPTURE_SCENES)[number];

export function parseFeedComposeCaptureScene(
  value: string | undefined,
): FeedComposeCaptureScene | undefined {
  if (!value) {
    return undefined;
  }
  return FEED_COMPOSE_CAPTURE_SCENES.includes(value as FeedComposeCaptureScene)
    ? (value as FeedComposeCaptureScene)
    : undefined;
}
