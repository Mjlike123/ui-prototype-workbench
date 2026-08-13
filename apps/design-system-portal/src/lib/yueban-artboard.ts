import { YUEBAN_ARTBOARD_WIDTH } from "./yueban-layers-manifest";
import { loadImageElement } from "./page-canvas-reference";

export async function exportArtboard750Png(
  imageSrc: string,
): Promise<{ blob: Blob; width: number; height: number; scale: number }> {
  const img = await loadImageElement(imageSrc);
  const sourceWidth = img.naturalWidth;
  const sourceHeight = img.naturalHeight;
  const scale = YUEBAN_ARTBOARD_WIDTH / sourceWidth;
  const width = YUEBAN_ARTBOARD_WIDTH;
  const height = Math.round(sourceHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("无法创建 750 画板。");
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (value) {
          resolve(value);
        } else {
          reject(new Error("PNG 导出失败。"));
        }
      },
      "image/png",
      1,
    );
  });

  return { blob, width, height, scale };
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
