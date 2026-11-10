"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { BottomNavigation } from "@/components/kit/bottom-navigation";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { ListTag } from "@/components/kit/list-tag";
import { PrimaryNavigation } from "@/components/kit/primary-navigation";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { SystemIcon } from "@/components/kit/system-icon";
import { FeedComposePagePrototype } from "@/components/prototypes/feed-compose-page-prototype";
import { FeedDetailPagePrototype } from "@/components/prototypes/feed-detail-page-prototype";
import { FeedPublishStatusHost } from "@/components/prototypes/feed-publish-status-host";
import {
  clearFeedComposeDraft,
  saveFeedComposeDraft,
} from "@/lib/feed-compose-session";

type MomentScene = "moment" | "my-moment" | "compose" | "detail";
type DetailVariant = "stranger" | "self" | "closed-region";

const SCENES: Array<{ id: MomentScene; label: string }> = [
  { id: "moment", label: "Moment 发布入口" },
  { id: "my-moment", label: "My Moment" },
  { id: "compose", label: "发布器（Core）" },
  { id: "detail", label: "动态详情" },
];

type StudioMomentPublishDetailPageProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack?: () => void;
};

/** Studio-only · v3.19.0 Moment 发布入口、圈子规则与动态详情增量 */
export function StudioMomentPublishDetailPage({
  width = 375,
  height = 812,
  theme = "light",
  onBack,
}: StudioMomentPublishDetailPageProps) {
  const [scene, setScene] = useState<MomentScene>("moment");
  const [composeKey, setComposeKey] = useState(0);
  const [detailVariant, setDetailVariant] =
    useState<DetailVariant>("stranger");

  const openCompose = () => {
    clearFeedComposeDraft();
    setComposeKey((current) => current + 1);
    setScene("compose");
  };

  const restoreFailedDraft = () => {
    saveFeedComposeDraft({
      caption: "Morning workout — every small step counts.",
      media: [],
      audience: "everyone",
    });
    setComposeKey((current) => current + 1);
    setScene("compose");
  };

  const selectScene = (next: MomentScene) => {
    if (next === "compose") {
      clearFeedComposeDraft();
      setComposeKey((current) => current + 1);
    }
    setScene(next);
  };

  return (
    <div
      className="studioVoiceRoomStatusShell studioMomentPublishShell"
      style={
        {
          "--page-canvas-width": `${width}px`,
        } as CSSProperties
      }
    >
      <div
        className="studioVoiceRoomStatusScenes"
        role="tablist"
        aria-label="Moment 交互原型场景"
      >
        {SCENES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={[
              "studioVoiceRoomStatusSceneTab",
              scene === item.id ? "studioVoiceRoomStatusSceneTab--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-selected={scene === item.id}
            onClick={() => selectScene(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {scene === "moment" ? (
        <div className="studioMomentDeviceStack">
          <MomentFeedScene
            width={width}
            height={height}
            theme={theme}
            onCompose={openCompose}
            onOpenDetail={() => setScene("detail")}
          />
          <button
            type="button"
            className="studioMomentFailedDraft"
            onClick={restoreFailedDraft}
          >
            <SystemIcon name="messageFailed" size={18} />
            <span>
              <strong>Post failed</strong>
              <small>Tap to edit your saved draft</small>
            </span>
            <SystemIcon name="chevronRight" size={16} />
          </button>
        </div>
      ) : null}

      {scene === "my-moment" ? (
        <MyMomentScene
          width={width}
          height={height}
          theme={theme}
          onBack={onBack}
          onCompose={openCompose}
          onOpenDetail={() => {
            setDetailVariant("self");
            setScene("detail");
          }}
        />
      ) : null}

      {scene === "compose" ? (
        <FeedComposePagePrototype
          key={composeKey}
          width={width}
          height={height}
          theme={theme}
          onBack={() => setScene("moment")}
          onPublished={() => setScene("moment")}
        />
      ) : null}

      {scene === "detail" ? (
        <>
          <div
            className="studioMomentDetailVariants"
            role="tablist"
            aria-label="动态详情用户状态"
          >
            {[
              { id: "stranger", label: "陌生人" },
              { id: "self", label: "本人动态" },
              { id: "closed-region", label: "ME / KSA" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={detailVariant === item.id}
                className={
                  detailVariant === item.id
                    ? "studioMomentVariant--active"
                    : undefined
                }
                onClick={() => setDetailVariant(item.id as DetailVariant)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div
            className={`studioMomentDetail studioMomentDetail--${detailVariant}`}
          >
            <FeedDetailPagePrototype
              key={detailVariant}
              width={width}
              height={height}
              theme={theme}
              onBack={() => setScene("moment")}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function MomentFeedScene({
  width,
  height,
  theme,
  onCompose,
  onOpenDetail,
}: {
  width: number;
  height: number;
  theme: "light" | "dark";
  onCompose: () => void;
  onOpenDetail: () => void;
}) {
  const [tab, setTab] = useState("Find");

  return (
    <div
      className="pageCanvasDevice prototypeDestinationDevice prototypeDestinationDevice--feed studioMomentFeedDevice"
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`Moment · ${width}×${height}`}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />
      <div className="pageCanvasContentShell">
        <PrimaryNavigation
          className="prototypeFeedNavigation"
          ariaLabel="Moment 分类"
          items={["Friends", "Find", "Room members"].map((label) => ({
            key: label,
            label,
          }))}
          value={tab}
          onChange={setTab}
          actions={[
            {
              key: "notification",
              label: "Moment 通知",
              icon: <SystemIcon name="notification" />,
            },
          ]}
        />
        <FeedPublishStatusHost />
        <main className="prototypeDestinationScroll studioMomentFeedScroll">
          <div className="studioMomentTopics" aria-label="圈子快捷入口">
            <button type="button">OOTD</button>
            <button type="button" className="studioMomentTopics--active">
              Fitness Check-in
            </button>
          </div>
          <article className="prototypeFeedCard">
            <header className="prototypeFeedAuthor">
              <AvatarVisual
                size={48}
                src="/prototypes/feed/andrew-avatar.png"
                alt=""
              />
              <div className="prototypeFeedIdentity">
                <strong>Andrew</strong>
                <span className="prototypeFeedTags">
                  <ListTag kind="gender" gender="male" age={28} />
                  <ListTag kind="membership" level={10} />
                </span>
              </div>
              <button
                type="button"
                className="prototypeFeedMore"
                aria-label="更多 Andrew"
              >
                <SystemIcon name="more" />
              </button>
            </header>
            <div className="prototypeFeedBody">
              <button
                type="button"
                className="prototypeFeedOpenDetail studioMomentFeedOpenDetail"
                aria-label="查看 Andrew 的动态详情"
                onClick={onOpenDetail}
              >
                <p className="prototypeFeedCaption">
                  I&apos;m 180 cm tall. I enjoy fitness and swimming. Come and
                  chat with me.{" "}
                  <span className="prototypeFeedSeeMore">...see more</span>
                </p>
                <span className="prototypeFeedMedia">
                  <Image
                    src="/prototypes/feed/latifa-photo.png"
                    alt="海边遮阳伞"
                    width={180}
                    height={180}
                  />
                </span>
              </button>
            </div>
          </article>
        </main>
        <button
          type="button"
          className="prototypeFeedCompose"
          aria-label="发布动态"
          onClick={onCompose}
        >
          <span>
            <SystemIcon name="publish" />
          </span>
        </button>
        <BottomNavigation value="feed" onChange={() => undefined} />
      </div>
    </div>
  );
}

function MyMomentScene({
  width,
  height,
  theme,
  onBack,
  onCompose,
  onOpenDetail,
}: {
  width: number;
  height: number;
  theme: "light" | "dark";
  onBack?: () => void;
  onCompose: () => void;
  onOpenDetail: () => void;
}) {
  return (
    <div
      className="pageCanvasDevice studioMyMomentDevice"
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`My Moment · ${width}×${height}`}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />
      <div className="pageCanvasContentShell">
        <RegularNavigation
          title="My Moment"
          onBack={onBack ?? (() => undefined)}
        />
        <main className="studioMyMomentList" aria-label="我的动态">
          <article className="studioMyMomentPost">
            <header>
              <AvatarVisual
                size={40}
                src="/prototypes/feed/andrew-avatar.png"
                alt=""
              />
              <strong>Andrew</strong>
              <SystemIcon name="more" />
            </header>
            <button
              type="button"
              className="studioMyMomentOpenDetail"
              onClick={onOpenDetail}
              aria-label="查看我的动态详情"
            >
              <Image
                src="/prototypes/feed/latifa-photo.png"
                alt="海边遮阳伞"
                width={180}
                height={180}
              />
              <small>23 minutes ago</small>
            </button>
            <footer aria-label="动态数据">
              <span>
                <SystemIcon name="like" size={22} /> 99
              </span>
              <span>
                <SystemIcon name="comment" size={22} /> 12
              </span>
            </footer>
          </article>
          <article className="studioMyMomentPost studioMyMomentPost--text">
            <header>
              <AvatarVisual
                size={40}
                src="/prototypes/feed/andrew-avatar.png"
                alt=""
              />
              <strong>Andrew</strong>
              <SystemIcon name="more" />
            </header>
            <p>
              I&apos;m 180 cm tall. I enjoy fitness, swimming and delicious
              food. Come and chat with me.
            </p>
            <small>23 minutes ago</small>
          </article>
        </main>
        <button
          type="button"
          className="prototypeFeedCompose"
          aria-label="从 My Moment 发布动态"
          onClick={onCompose}
        >
          <span>
            <SystemIcon name="publish" />
          </span>
        </button>
      </div>
    </div>
  );
}
