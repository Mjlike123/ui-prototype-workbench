export type PageCanvasReferenceState = {
  fileName: string;
  dataUrl: string;
  objectUrl: string;
};

export const MAX_REFERENCE_IMAGE_BYTES = 8 * 1024 * 1024;

export async function readReferenceImageFile(
  file: File,
): Promise<PageCanvasReferenceState> {
  if (!file.type.startsWith("image/")) {
    throw new Error("请选择 PNG、JPG 或 WebP 图片。");
  }
  if (file.size > MAX_REFERENCE_IMAGE_BYTES) {
    throw new Error("图片过大，请使用 8MB 以内的截图。");
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const dataUrl = await fileToDataUrl(file);
    return { fileName: file.name, dataUrl, objectUrl };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("无法读取图片。"));
      }
    };
    reader.onerror = () => reject(new Error("无法读取图片。"));
    reader.readAsDataURL(file);
  });
}

export function revokeReferenceImage(ref: PageCanvasReferenceState | null) {
  if (ref?.objectUrl) {
    URL.revokeObjectURL(ref.objectUrl);
  }
}

export async function loadImageElement(
  src: string,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("参考图加载失败。"));
    img.src = src;
  });
}
