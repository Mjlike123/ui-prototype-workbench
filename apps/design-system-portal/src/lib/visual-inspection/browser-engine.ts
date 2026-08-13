import { inspectPixelBuffers } from "./pixel-engine";
import type { InspectionBox, InspectionResult, PixelBuffer } from "./types";

export type BrowserInspectionInput = {
  reference: HTMLImageElement;
  implementation: HTMLImageElement;
  referenceFileName: string;
  implementationFileName: string;
  threshold?: number;
  ignoreRegions?: InspectionBox[];
};

export async function inspectBrowserImages(
  input: BrowserInspectionInput,
): Promise<InspectionResult> {
  await yieldToBrowser();
  const implementation = readImagePixels(
    input.implementation,
    input.implementation.naturalWidth,
    input.implementation.naturalHeight,
  );
  const reference = readImagePixels(
    input.reference,
    input.reference.naturalWidth,
    input.reference.naturalHeight,
  );
  return inspectPixelBuffers({
    reference,
    implementation,
    referenceFileName: input.referenceFileName,
    implementationFileName: input.implementationFileName,
    threshold: input.threshold,
    ignoreRegions: input.ignoreRegions,
  });
}

function readImagePixels(
  image: HTMLImageElement,
  width: number,
  height: number,
): PixelBuffer {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("当前浏览器无法读取图片像素。");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return {
    width,
    height,
    data: context.getImageData(0, 0, width, height).data,
  };
}

function yieldToBrowser() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });
}
