import { expect, test } from "@playwright/test";

test("navigates the component catalog and changes preview state", async ({
  page,
}) => {
  await page.goto("/components");
  await expect(page.getByRole("heading", { name: "组件体系" })).toBeVisible();

  await page.getByRole("link", { name: /二级 Tab（下划线）/ }).click();
  await expect(page).toHaveURL(
    /\/components\/secondary-tab-underline$/,
  );
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "二级 Tab（下划线）",
    }),
  ).toBeVisible();

  const movement = page.getByRole("tab", { name: "Movement(6)" });
  await movement.click();
  await expect(movement).toHaveAttribute("aria-selected", "true");

  await page.getByRole("tab", { name: "About me" }).click();
  const swipeArea = page.getByLabel("可左右滑动的 Tab 内容");
  const box = await swipeArea.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.78, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width * 0.22,
      box.y + box.height / 2,
      { steps: 6 },
    );
    await page.mouse.up();
  }
  await expect(movement).toHaveAttribute("aria-selected", "true");

  await page.getByRole("link", { name: "交互", exact: true }).click();
  await expect(page).toHaveURL(/#interaction$/);
  await expect(
    page.getByRole("heading", { name: "状态与手势如何流动" }),
  ).toBeVisible();
});

test("component detail visual baseline", async ({ page }) => {
  await page.goto("/components/secondary-tab-underline");
  await expect(
    page.getByRole("heading", { name: "二级 Tab（下划线）" }),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("secondary-tab-editorial-page.png", {
    animations: "disabled",
  });
});

test("previews primary navigation variants", async ({ page }) => {
  await page.goto("/components/primary-navigation");
  await expect(
    page.getByRole("heading", { name: "一级导航", exact: true }),
  ).toBeVisible();

  await page.getByLabel("标题数量").selectOption("5");
  await page.getByLabel("尾部操作").selectOption("all");
  await page.getByRole("tab", { name: "Country" }).click();

  await expect(
    page.getByRole("tab", { name: "Country" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: "Nearby" })).toBeVisible();
  await expect(page.getByRole("button", { name: "News" })).toBeVisible();
});

test("previews regular navigation title constraints", async ({ page }) => {
  await page.goto("/components/regular-navigation");
  await expect(
    page.getByRole("heading", { name: "常规导航栏", exact: true }),
  ).toBeVisible();

  await page.getByLabel("前置操作").selectOption("close");
  await page.getByLabel("标题适配").selectOption("subtitle");
  await page.getByLabel("尾部操作").selectOption("button");

  await expect(page.getByRole("button", { name: "关闭" })).toBeVisible();
  await expect(
    page.getByText("副标题超出展示区域时省略"),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Post" })).toBeVisible();
});

test("previews bottom navigation themes and destinations", async ({ page }) => {
  await page.goto("/components/bottom-navigation");
  await expect(
    page.getByRole("heading", { name: "底部导航", exact: true }),
  ).toBeVisible();

  await page.getByLabel("当前目的地").selectOption("3");
  await page.getByLabel("区域主题").selectOption("dark");
  await expect(
    page.getByRole("button", { name: "Message" }),
  ).toHaveAttribute("aria-current", "page");

  await page.getByLabel("首项目的地").selectOption("refresh");
  await expect(
    page.getByRole("button", { name: "Refresh" }),
  ).toHaveAttribute("aria-current", "page");
});

test("previews button sizes, states and responsive groups", async ({ page }) => {
  await page.goto("/components/button");
  await expect(
    page.getByRole("heading", { name: "按钮", exact: true }),
  ).toBeVisible();

  await page.getByLabel("按钮高度").selectOption("height24");
  await page.getByLabel("视觉类型").selectOption("primary-outline");
  await page.getByLabel("按钮状态").selectOption("disabled");
  await page.getByLabel("布局方式").selectOption("double");

  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeDisabled();
  await expect(page.locator(".kitButtonGroup")).toHaveClass(
    /kitButtonGroup--hug/,
  );
});

test("shows an empty search recovery state", async ({ page }) => {
  await page.goto("/search?q=not-a-real-component");
  await expect(
    page.getByRole("heading", { name: "没有找到匹配内容" }),
  ).toBeVisible();
});

test("runs the local visual inspection workflow and exports JSON", async ({
  page,
}, testInfo) => {
  await page.goto("/audit");
  await page
    .getByRole("link", { name: "打开视觉走查工作台 →" })
    .click();
  await expect(page).toHaveURL(/\/audit\/visual$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "视觉走查工作台" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "面包屑" }),
  ).toContainText("验收中心/视觉走查工作台");
  if (testInfo.project.name === "desktop-chromium") {
    await expect(
      page
        .getByRole("navigation", { name: "主导航" })
        .getByRole("link", { name: "视觉走查工作台" }),
    ).toHaveAttribute("aria-current", "page");
  }

  const fixture = {
    name: "same.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    ),
  };
  const inputs = page.locator('input[type="file"]');
  await inputs.nth(0).setInputFiles(fixture);
  await inputs.nth(1).setInputFiles(fixture);
  await page.getByRole("button", { name: "开始走查" }).click();
  await expect(page.getByRole("status")).toContainText("走查完成");
  await expect(page.getByText(/0 \/ 0 个区域/)).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("visual-inspection.json");
});
