import { readdir } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { ContentDocument } from "@/components/content-document";
import { FoundationTabs } from "@/components/foundation-tabs";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { ListTag } from "@/components/kit/list-tag";
import { PagIcon } from "@/components/kit/pag-icon";
import { SystemIcon } from "@/components/kit/system-icon";
import { getCatalog, getFoundationContent } from "@/lib/catalog";
import {
  getFoundationNavLabel,
  sortFoundationsByNavOrder,
} from "@/lib/foundation-nav";

export const metadata: Metadata = {
  title: "视觉基础",
};

function IconTokenPreview({ tokenId }: { tokenId: string }) {
  let preview: React.ReactNode = null;

  switch (tokenId) {
    case "icon.frame.default":
      preview = (
        <span className="iconTokenFrameDemo">
          <SystemIcon name="notification" />
        </span>
      );
      break;
    case "icon.spacing.inline":
      preview = (
        <span className="iconTokenSpacingDemo">
          <SystemIcon name="comment" />
          <strong>Label</strong>
        </span>
      );
      break;
    case "icon.color.default":
      preview = <SystemIcon name="notification" size={32} />;
      break;
    case "icon.color.semantic":
      preview = (
        <SystemIcon
          name="chat"
          size={32}
          className="iconTokenSemanticDemo"
        />
      );
      break;
    case "icon.asset.product":
      preview = (
        <span className="iconTokenProductDemo">
          <Image
            src="/icons/product/toptop-coin.png"
            alt=""
            width={32}
            height={32}
          />
          <Image
            src="/icons/product/toptop-check-in.png"
            alt=""
            width={32}
            height={32}
          />
          <Image
            src="/icons/product/toptop-ranking.png"
            alt=""
            width={32}
            height={32}
          />
        </span>
      );
      break;
    case "icon.asset.animated-pag":
      preview = (
        <PagIcon
          src="/icons/animated/profile-mini-card-room.pag"
          size={32}
          fallback={<SystemIcon name="voiceStatus" size={32} />}
        />
      );
      break;
    case "icon.asset.identity-tag":
      preview = (
        <span className="iconTokenIdentityDemo">
          <ListTag kind="membership" level={13} />
          <ListTag kind="gender" gender="female" age={28} />
        </span>
      );
      break;
    case "icon.asset.ios-status-bar":
      preview = (
        <span className="iconTokenStatusBarDemo">
          <IosStatusBar appearance="dark-content" />
        </span>
      );
      break;
  }

  return preview ? (
    <div className="iconTokenPreview" aria-hidden="true">
      {preview}
    </div>
  ) : null;
}

export default async function FoundationsPage() {
  const { foundations: catalogFoundations } = await getCatalog();
  const foundations = sortFoundationsByNavOrder(catalogFoundations);
  const [
    svgIconFiles,
    productIconFiles,
    animatedIconFiles,
    listTagIconFiles,
    avatarIconFiles,
    imageEmptyIconFiles,
    emptyStateIconFiles,
    foundationContentEntries,
  ] = await Promise.all([
    readdir(path.join(process.cwd(), "public/icons/svg")),
    readdir(path.join(process.cwd(), "public/icons/product")),
    readdir(path.join(process.cwd(), "public/icons/animated")),
    readdir(path.join(process.cwd(), "public/icons/list-tags")),
    readdir(path.join(process.cwd(), "public/icons/avatar")),
    readdir(path.join(process.cwd(), "public/icons/image-empty")),
    readdir(path.join(process.cwd(), "public/icons/empty-state")),
    Promise.all(
      foundations.map(async (foundation) => [
        foundation.id,
        await getFoundationContent(foundation.id),
      ] as const),
    ),
  ]);
  const foundationContent = new Map(foundationContentEntries);
  const sortedSvgIconFiles = svgIconFiles
    .filter((file) => file.endsWith(".svg"))
    .sort((a, b) => a.localeCompare(b, "zh-CN"));
  const sortedProductIconFiles = productIconFiles
    .filter((file) => file.endsWith(".png"))
    .sort((a, b) => a.localeCompare(b, "zh-CN"));
  const sortedAnimatedIconFiles = animatedIconFiles
    .filter((file) => file.endsWith(".pag"))
    .sort((a, b) => a.localeCompare(b, "zh-CN"));
  const sortedListTagIconFiles = listTagIconFiles
    .filter((file) => /\.(png|svg)$/.test(file))
    .sort((a, b) => a.localeCompare(b, "zh-CN", { numeric: true }));
  const sortedAvatarIconFiles = avatarIconFiles
    .filter((file) => file.endsWith(".png"))
    .sort((a, b) => a.localeCompare(b, "zh-CN"));
  const sortedImageEmptyIconFiles = imageEmptyIconFiles
    .filter((file) => file.endsWith(".png"))
    .sort((a, b) => a.localeCompare(b, "zh-CN"));
  const sortedEmptyStateIconFiles = emptyStateIconFiles
    .filter((file) => file.endsWith(".png"))
    .sort((a, b) => a.localeCompare(b, "zh-CN"));

  return (
    <>
      <header className="pageHeader">
        <div>
          <p className="eyebrow">FOUNDATIONS</p>
          <h1 className="pageTitle">视觉基础</h1>
          <p className="pageDescription">
            使用语义 Token 连接 Figma、Web、iOS 和
            Android。业务代码不直接依赖具体色值、字号或间距。
          </p>
        </div>
        <div className="headerActions">
          <span className="readonlyBadge">
            {foundations.reduce(
              (sum, foundation) => sum + foundation.tokens.length,
              0,
            )}{" "}
            Tokens
          </span>
        </div>
      </header>

      <FoundationTabs
        items={foundations.map((foundation) => ({
          id: foundation.id,
          label: getFoundationNavLabel(foundation.id),
        }))}
      />

      {foundations.map((foundation) => (
        <section
          className="tokenSection"
          id={foundation.id}
          key={foundation.id}
        >
          <div className="sectionHeader">
            <div>
              <h2 className="sectionTitle">
                {getFoundationNavLabel(foundation.id)} · {foundation.title}
              </h2>
              <p className="sectionDescription">{foundation.description}</p>
            </div>
            <span className="tag">{foundation.id}</span>
          </div>
          <div className="tokenGrid">
            {foundation.tokens.map((token) => (
              <article className="tokenCard" key={token.id}>
                {foundation.category === "color" && (
                  token.modes ? (
                    <div className="tokenModeSwatches">
                      <div>
                        <div
                          className="tokenSwatch"
                          style={{ background: String(token.modes.light) }}
                        />
                        <span>Light</span>
                      </div>
                      <div>
                        <div
                          className="tokenSwatch"
                          style={{ background: String(token.modes.dark) }}
                        />
                        <span>Dark</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="tokenSwatch"
                      style={{ background: String(token.value) }}
                    />
                  )
                )}
                {foundation.category === "typography" && (
                  <div
                    style={{
                      font: String(token.value),
                      marginBottom: 12,
                      minHeight: 52,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    TopTop 设计语言
                  </div>
                )}
                {foundation.category === "spacing" && (
                  <div
                    style={{
                      width: Math.min(Number(token.value) * 3, 150),
                      height: 12,
                      margin: "18px 0 34px",
                      background: "#111111",
                    }}
                  />
                )}
                {foundation.category === "radius" && (
                  <div
                    className="radiusTokenPreview"
                    style={{
                      borderRadius:
                        Number(token.value) >= 999
                          ? "999px"
                          : `${Number(token.value)}px`,
                    }}
                  />
                )}
                {foundation.category === "icon" && (
                  <IconTokenPreview tokenId={token.id} />
                )}
                {foundation.category === "motion" && (
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      marginBottom: 18,
                      background: "#eeeeeb",
                      border: "8px solid #111111",
                    }}
                  />
                )}
                <strong>{token.name}</strong>
                <code className="tokenValue">{String(token.value)}</code>
                {token.modes && (
                  <>
                    <code className="tokenValue">
                      Light: {String(token.modes.light)}
                    </code>
                    <code className="tokenValue">
                      Dark: {String(token.modes.dark)}
                    </code>
                  </>
                )}
                <code className="tokenValue">{token.id}</code>
                <p className="tokenDescription">{token.description}</p>
              </article>
            ))}
          </div>
          {foundationContent.get(foundation.id) && (
            <div className="contentCard">
              <ContentDocument
                source={foundationContent.get(foundation.id) ?? ""}
              />
            </div>
          )}
          {foundation.category === "radius" && <RadiusUsageShowcase />}
          {foundation.category === "icon" && (
            <IconFoundationShowcase
              svgFiles={sortedSvgIconFiles}
              productFiles={sortedProductIconFiles}
              animatedFiles={sortedAnimatedIconFiles}
              listTagFiles={sortedListTagIconFiles}
              avatarFiles={sortedAvatarIconFiles}
              imageEmptyFiles={sortedImageEmptyIconFiles}
              emptyStateFiles={sortedEmptyStateIconFiles}
            />
          )}
        </section>
      ))}
    </>
  );
}

function IconFoundationShowcase({
  svgFiles,
  productFiles,
  animatedFiles,
  listTagFiles,
  avatarFiles,
  imageEmptyFiles,
  emptyStateFiles,
}: {
  svgFiles: string[];
  productFiles: string[];
  animatedFiles: string[];
  listTagFiles: string[];
  avatarFiles: string[];
  imageEmptyFiles: string[];
  emptyStateFiles: string[];
}) {
  return (
    <section className="iconFoundationShowcase" aria-labelledby="icon-library-title">
      <div className="iconFoundationHeader">
        <div>
          <p className="eyebrow">ICON LIBRARY</p>
          <h3 id="icon-library-title">图标资源</h3>
        </div>
        <span>
          {svgFiles.length +
            productFiles.length +
            animatedFiles.length +
            listTagFiles.length +
            avatarFiles.length +
            imageEmptyFiles.length +
            emptyStateFiles.length}{" "}
          个图标
        </span>
      </div>
      <div className="iconFoundationSubheader">
        <strong>线性 SVG</strong>
        <span>统一 24px Frame，可使用语义色</span>
      </div>
      <div className="iconFoundationGrid">
        {svgFiles.map((file) => {
          const name = file.replace(/^icon=/, "").replace(/\.svg$/, "");
          return (
            <article className="iconFoundationItem" key={file}>
              <div className="iconFoundationFrame">
                <Image
                  alt=""
                  aria-hidden="true"
                  src={`/icons/svg/${file}`}
                  width={24}
                  height={24}
                />
              </div>
              <strong>{name}</strong>
              <code>{file}</code>
            </article>
          );
        })}
      </div>
      <div className="iconFoundationSubheader">
        <strong>彩色业务图标</strong>
        <span>透明 PNG 切图，保持原始配色与比例</span>
      </div>
      <div className="iconFoundationGrid">
        {productFiles.map((file) => {
          const name = file.replace(/^toptop-/, "").replace(/\.png$/, "");
          return (
            <article className="iconFoundationItem" key={file}>
              <div className="iconFoundationFrame iconFoundationFrame--product">
                <Image
                  alt=""
                  aria-hidden="true"
                  src={`/icons/product/${file}`}
                  width={40}
                  height={40}
                />
              </div>
              <strong>{name}</strong>
              <code>{file}</code>
            </article>
          );
        })}
      </div>
      <div className="iconFoundationSubheader">
        <strong>PAG 动画图标</strong>
        <span>保留源文件比例，按业务组件尺寸播放并提供静态兜底</span>
      </div>
      <div className="iconFoundationGrid">
        {animatedFiles.map((file) => {
          const name = file.replace(/\.pag$/, "");
          return (
            <article className="iconFoundationItem" key={file}>
              <div className="iconFoundationFrame">
                <PagIcon
                  src={`/icons/animated/${file}`}
                  fallback={<SystemIcon name="voiceStatus" />}
                />
              </div>
              <strong>{name}</strong>
              <code>{file}</code>
            </article>
          );
        })}
      </div>
      <div className="iconFoundationSubheader">
        <strong>身份标签切图</strong>
        <span>性别 SVG 与会员 PNG，按组件规定尺寸使用</span>
      </div>
      <div className="iconFoundationGrid">
        {listTagFiles.map((file) => {
          const name = file.replace(/\.(png|svg)$/, "");
          return (
            <article className="iconFoundationItem" key={file}>
              <div className="iconFoundationFrame iconFoundationFrame--product">
                <Image
                  alt=""
                  aria-hidden="true"
                  src={`/icons/list-tags/${file}`}
                  width={48}
                  height={18}
                />
              </div>
              <strong>{name}</strong>
              <code>{file}</code>
            </article>
          );
        })}
      </div>
      <div className="iconFoundationSubheader">
        <strong>默认空状态头像</strong>
        <span>216px @3x PNG 切图，按业务尺寸等比缩放</span>
      </div>
      <div className="iconFoundationGrid">
        {avatarFiles.map((file) => {
          const name = file.replace(/^default-empty-/, "").replace(/\.png$/, "");
          return (
            <article className="iconFoundationItem" key={file}>
              <div
                className={`iconFoundationFrame iconFoundationFrame--product${
                  name === "dark" ? " iconFoundationFrame--dark" : ""
                }`}
              >
                <Image
                  alt=""
                  aria-hidden="true"
                  src={`/icons/avatar/${file}`}
                  width={72}
                  height={72}
                />
              </div>
              <strong>{name}</strong>
              <code>{file}</code>
            </article>
          );
        })}
      </div>
      <div className="iconFoundationSubheader">
        <strong>图片空状态切图</strong>
        <span>216px @3x picture 图标，亮暗各一</span>
      </div>
      <div className="iconFoundationGrid">
        {imageEmptyFiles.map((file) => {
          const name = file.replace(/^picture-/, "").replace(/\.png$/, "");
          return (
            <article className="iconFoundationItem" key={file}>
              <div
                className={`iconFoundationFrame iconFoundationFrame--product${
                  name === "dark" ? " iconFoundationFrame--dark" : ""
                }`}
              >
                <Image
                  alt=""
                  aria-hidden="true"
                  src={`/icons/image-empty/${file}`}
                  width={72}
                  height={72}
                />
              </div>
              <strong>{name}</strong>
              <code>{file}</code>
            </article>
          );
        })}
      </div>
      <div className="iconFoundationSubheader">
        <strong>页面空状态插画</strong>
        <span>480px @3x 业务空态切图，展示 160pt / 50% 不透明度</span>
      </div>
      <div className="iconFoundationGrid">
        {emptyStateFiles.map((file) => {
          const name = file.replace(/\.png$/, "");
          return (
            <article className="iconFoundationItem" key={file}>
              <div className="iconFoundationFrame iconFoundationFrame--product">
                <Image
                  alt=""
                  aria-hidden="true"
                  src={`/icons/empty-state/${file}`}
                  width={160}
                  height={160}
                />
              </div>
              <strong>{name}</strong>
              <code>{file}</code>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function RadiusUsageShowcase() {
  return (
    <section className="radiusUsageShowcase" aria-labelledby="radius-usage-title">
      <div className="radiusUsageHeader">
        <div>
          <p className="eyebrow">BUSINESS EXAMPLES</p>
          <h3 id="radius-usage-title">业务中的圆角用法</h3>
        </div>
        <p>圆角越大，越强调独立操作；圆角越小，越适合承载内容和紧凑信息。</p>
      </div>

      <div className="radiusUsageList">
        <article className="radiusUsageItem">
          <div className="radiusExample radiusExample--button">
            <span>全局按钮</span>
          </div>
          <div>
            <strong>按钮全圆角</strong>
            <p>半径取控件高度的 50%，形成完整胶囊形。</p>
          </div>
          <code>radius.full</code>
        </article>

        <article className="radiusUsageItem">
          <div className="radiusExample radiusExample--dialog">
            <strong>操作提示</strong>
            <p>告知当前状态与解决方法，正文尽量控制在三行内。</p>
            <button type="button">我知道了</button>
          </div>
          <div>
            <strong>中间弹窗、底部 Sheet</strong>
            <p>中间弹窗使用四角 16；底部 Sheet 仅顶部使用 16。</p>
          </div>
          <code>radius.16</code>
        </article>

        <article className="radiusUsageItem">
          <div className="radiusExample radiusExample--list">
            <span className="radiusExampleAvatar" aria-hidden="true">T</span>
            <span>
              <strong>namenamename</strong>
              <small>列表信息与状态标签</small>
            </span>
            <b aria-hidden="true">›</b>
          </div>
          <div>
            <strong>列表外框、大卡片</strong>
            <p>将同组信息收拢为一个清晰的内容模块。</p>
          </div>
          <code>radius.12</code>
        </article>

        <article className="radiusUsageItem">
          <div className="radiusExample radiusExample--compact">
            <span className="radiusExampleCover" aria-hidden="true" />
            <span className="radiusExampleTag">B</span>
          </div>
          <div>
            <strong>房间封面与标签</strong>
            <p>小卡片使用 8；小型状态标签使用 4。</p>
          </div>
          <code>radius.8 / radius.4</code>
        </article>
      </div>
    </section>
  );
}
