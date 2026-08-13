export type YuebanCompareResult = {
  expected_size: [number, number];
  actual_size: [number, number];
  same_size: boolean;
  compared_size: [number, number];
  threshold: number;
  changed_pixel_ratio: number;
  mae: number;
  max_rgb_diff: number;
  pass: boolean;
};

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = src;
  });
}

function readPixels(
  img: HTMLImageElement,
  width: number,
  height: number,
): Uint8ClampedArray {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("无法读取像素。");
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height).data;
}

/** 浏览器内叠图差异（对齐 scripts/compare-images.py 口径）。 */
export async function compareReferenceImages(input: {
  expectedSrc: string;
  actualSrc: string;
  threshold?: number;
  failRatio?: number;
}): Promise<YuebanCompareResult> {
  const threshold = input.threshold ?? 8;
  const [expectedImg, actualImg] = await Promise.all([
    loadImage(input.expectedSrc),
    loadImage(input.actualSrc),
  ]);

  const expected_size: [number, number] = [
    expectedImg.naturalWidth,
    expectedImg.naturalHeight,
  ];
  const actual_size: [number, number] = [
    actualImg.naturalWidth,
    actualImg.naturalHeight,
  ];
  const same_size =
    expected_size[0] === actual_size[0] && expected_size[1] === actual_size[1];
  const width = Math.min(expected_size[0], actual_size[0]);
  const height = Math.min(expected_size[1], actual_size[1]);

  const expectedPx = readPixels(expectedImg, width, height);
  const actualPx = readPixels(actualImg, width, height);

  let changed = 0;
  let sumDiff = 0;
  let maxDiff = 0;
  const pixels = width * height;

  for (let i = 0; i < pixels; i += 1) {
    const o = i * 4;
    let maxChannel = 0;
    for (let c = 0; c < 3; c += 1) {
      const d = Math.abs(expectedPx[o + c]! - actualPx[o + c]!);
      maxChannel = Math.max(maxChannel, d);
      sumDiff += d;
    }
    maxDiff = Math.max(maxDiff, maxChannel);
    if (maxChannel > threshold) {
      changed += 1;
    }
  }

  const changed_pixel_ratio = pixels > 0 ? changed / pixels : 0;
  const mae = pixels > 0 ? sumDiff / (pixels * 3) : 0;

  const pass =
    same_size &&
    (input.failRatio == null || changed_pixel_ratio <= input.failRatio);

  return {
    expected_size,
    actual_size,
    same_size,
    compared_size: [width, height],
    threshold,
    changed_pixel_ratio: Math.round(changed_pixel_ratio * 1_000_000) / 1_000_000,
    mae: Math.round(mae * 10_000) / 10_000,
    max_rgb_diff: maxDiff,
    pass,
  };
}
