/** Logical px → bitmap px for prototype list avatars (iOS @3x). */
export const DISPLAY_IMAGE_DENSITY = 3;

export function displayImagePixels(displaySize: number) {
  return displaySize * DISPLAY_IMAGE_DENSITY;
}
