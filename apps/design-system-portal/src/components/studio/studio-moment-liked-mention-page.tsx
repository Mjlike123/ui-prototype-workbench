"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { CenterDialog } from "@/components/kit/center-dialog";
import { EmptyState } from "@/components/kit/empty-state";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { ListTag, type MembershipLevel } from "@/components/kit/list-tag";
import { RegularListItem } from "@/components/kit/regular-list-item";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { SearchControl } from "@/components/kit/search-control";
import { SystemIcon } from "@/components/kit/system-icon";
import { Toast } from "@/components/kit/toast";
import { FeedComposePagePrototype } from "@/components/prototypes/feed-compose-page-prototype";
import { FeedDetailPagePrototype } from "@/components/prototypes/feed-detail-page-prototype";
import { ProfilePagePrototype } from "@/components/prototypes/profile-page-prototype";
import { PrototypeDestinationPage } from "@/components/prototypes/prototype-destination-page";
import {
  saveFeedComposeDraft,
} from "@/lib/feed-compose-session";
import { useTimedPresence } from "@/lib/use-timed-presence";

type Scene =
  | "feed-structure"
  | "profile-liked"
  | "liked-list"
  | "compose-mention"
  | "comment-mention"
  | "notifications";

type RegionMode = "open" | "closed";

type LikedMoment = {
  id: string;
  user: string;
  avatar: string;
  gender: "female" | "male";
  age: number;
  membership: MembershipLevel;
  likedAt: string;
  caption: string;
  hashtags: string[];
  media?: string;
  likes: number;
  comments: number;
};

const SCENES: Array<{ id: Scene; label: string }> = [
  { id: "feed-structure", label: "动态结构" },
  { id: "profile-liked", label: "Profile 入口" },
  { id: "liked-list", label: "我赞过的" },
  { id: "compose-mention", label: "发布 @" },
  { id: "comment-mention", label: "评论 @" },
  { id: "notifications", label: "动态通知" },
];

const FRIENDS = [
  {
    id: "u1",
    name: "Latifa Alghanim",
    meta: "Recently active",
    avatar: "/prototypes/feed/latifa-avatar.png",
  },
  {
    id: "u2",
    name: "Andrew",
    meta: "Following",
    avatar: "/prototypes/feed/andrew-avatar.png",
  },
  {
    id: "u3",
    name: "Mariam",
    meta: "Friend",
    avatar: "/prototypes/toptop-home/avatar-felix.png",
  },
  {
    id: "u4",
    name: "Yousef",
    meta: "Following",
    avatar: "/prototypes/message/conversation-3.png",
  },
];

const NOTIFICATIONS = [
  {
    id: "n1",
    title: "Latifa 赞了你的动态",
    time: "3 分钟前",
    avatar: "/prototypes/feed/latifa-avatar.png",
  },
  {
    id: "n2",
    title: "Andrew 回复了你的评论",
    time: "18 分钟前",
    avatar: "/prototypes/feed/andrew-avatar.png",
  },
  {
    id: "n3",
    title: "Mariam 在动态中提到了你",
    time: "昨天",
    avatar: "/prototypes/toptop-home/avatar-felix.png",
  },
];

const LIKED_MOMENTS: LikedMoment[] = [
  {
    id: "latifa-evening-swim",
    user: "Latifa Alghanim",
    avatar: "/prototypes/feed/latifa-avatar.png",
    gender: "female",
    age: 28,
    membership: 13,
    likedAt: "12 分钟前赞过",
    caption:
      "傍晚游完泳，刚好赶上最后一束阳光。最近开始认真记录那些让我慢下来的时刻。",
    hashtags: ["#OOTD", "#WhileTheSunIsShining"],
    media: "/prototypes/feed/latifa-photo.png",
    likes: 128,
    comments: 24,
  },
  {
    id: "andrew-weekend-plan",
    user: "Andrew",
    avatar: "/prototypes/feed/andrew-avatar.png",
    gender: "male",
    age: 28,
    membership: 10,
    likedAt: "昨天赞过",
    caption:
      "周末想组一个轻松的游泳局，不拼速度。有人也想一起练习自由泳吗？",
    hashtags: ["#WeekendPlan"],
    likes: 56,
    comments: 18,
  },
];

type StudioMomentLikedMentionPageProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  initialScene?: Scene;
  initialRegion?: RegionMode;
};

function MentionPickerSheet({
  open,
  query,
  selectedIds,
  onQueryChange,
  onToggle,
  onClose,
  onConfirm,
}: {
  open: boolean;
  query: string;
  selectedIds: string[];
  onQueryChange: (value: string) => void;
  onToggle: (id: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const presence = useTimedPresence(open, 200);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FRIENDS;
    return FRIENDS.filter((friend) => friend.name.toLowerCase().includes(q));
  }, [query]);

  if (!presence.mounted) return null;

  return (
    <div
      className={[
        "feedComposeOverlay",
        presence.phase === "exit" ? "feedComposeOverlay--exit" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-state={presence.phase}
      role="presentation"
    >
      <button
        type="button"
        className="feedComposeOverlayBackdrop"
        aria-label="关闭好友选择"
        onClick={onClose}
      />
      <section
        className="feedComposeMediaSheet feedComposeAudienceSheet studioMomentMentionSheet"
        aria-label="提及好友"
        role="dialog"
        aria-modal="true"
        data-kit-gap="mention-picker-sheet"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
            return;
          }
          if (event.key !== "Tab") return;
          const focusable = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'input:not([disabled]), button:not([disabled])',
            ),
          );
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="feedComposeMediaSheetHandle" aria-hidden="true" />
        <header className="feedComposeMediaSheetHeader">
          <h2>提及好友</h2>
          <p>
            {selectedIds.length > 0
              ? `已选择 ${selectedIds.length} 位好友`
              : "选择想提醒的好友"}
          </p>
        </header>
        <div className="studioMomentMentionSearch">
          <SearchControl
            value={query}
            active
            onActivate={() => undefined}
            onCancel={onClose}
            onChange={onQueryChange}
            placeholder="搜索好友"
            ariaLabel="搜索好友"
          />
        </div>
        <div className="feedComposeAudienceOptions" role="list">
          {filtered.length === 0 ? (
            <p className="studioMomentMentionNoResults">未找到好友</p>
          ) : null}
          {filtered.map((friend) => {
            const selected = selectedIds.includes(friend.id);
            return (
              <RegularListItem
                key={friend.id}
                listType="action"
                title={friend.name}
                subtitle={friend.meta}
                ariaLabel={`${friend.name}${selected ? "，已选择" : ""}`}
                leading={
                  <AvatarVisual
                    size={40}
                    src={friend.avatar}
                    alt=""
                  />
                }
                className={
                  selected
                    ? "feedComposeAudienceOption feedComposeAudienceOption--selected"
                    : "feedComposeAudienceOption"
                }
                trailing={
                  selected ? (
                    <span
                      className="feedComposeAudienceOptionMark"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  ) : undefined
                }
                onPress={() => onToggle(friend.id)}
              />
            );
          })}
        </div>
        <div className="studioMomentMentionSheetActions">
          <button
            type="button"
            className="kitButton kitButton--height40 kitButton--neutral"
            onClick={onClose}
          >
            取消
          </button>
          <button
            type="button"
            className="kitButton kitButton--height40 kitButton--primary"
            disabled={selectedIds.length === 0}
            onClick={onConfirm}
          >
            完成
          </button>
        </div>
      </section>
    </div>
  );
}

function PrototypeLikedMomentCard({
  moment,
  mode,
  selected = false,
  removing = false,
  onOpen,
  onUnlike,
}: {
  moment: LikedMoment;
  mode: "list" | "detail";
  selected?: boolean;
  removing?: boolean;
  onOpen: () => void;
  onUnlike: () => void;
}) {
  return (
    <article
      className={[
        "studioLikedMomentCard",
        `studioLikedMomentCard--${mode}`,
        moment.media ? "studioLikedMomentCard--has-media" : "",
        selected ? "studioLikedMomentCard--selected" : "",
        removing ? "studioLikedMomentCard--removing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-kit-gap="liked-moment-card"
      data-state={removing ? "removing" : "default"}
    >
      <header className="studioLikedMomentAuthor">
        <AvatarVisual
          size={mode === "detail" ? 48 : 40}
          src={moment.avatar}
          alt=""
        />
        <div className="studioLikedMomentIdentity">
          <strong>{moment.user}</strong>
          <div className="studioLikedMomentTags">
            <ListTag
              kind="gender"
              gender={moment.gender}
              age={moment.age}
            />
            <ListTag kind="membership" level={moment.membership} />
          </div>
        </div>
        <span className="studioLikedMomentLikedAt">{moment.likedAt}</span>
      </header>

      <button
        type="button"
        className="studioLikedMomentContent"
        aria-label={`打开 ${moment.user} 的动态详情`}
        onClick={onOpen}
      >
        <p className="studioLikedMomentCaption">
          {moment.hashtags.map((hashtag) => (
            <mark key={hashtag}>{hashtag} </mark>
          ))}
          {moment.caption}
        </p>
        {moment.media ? (
          <span className="studioLikedMomentMedia">
            <Image
              src={moment.media}
              alt={`${moment.user} 的动态照片`}
              fill
              sizes={
                mode === "detail"
                  ? "(min-width: 700px) 420px, calc(100vw - 64px)"
                  : "(min-width: 700px) 280px, calc(100vw - 64px)"
              }
            />
          </span>
        ) : null}
      </button>

      <footer className="studioLikedMomentActions">
        <button
          type="button"
          className="studioLikedMomentLike"
          aria-label={`取消点赞 ${moment.user} 的动态`}
          aria-pressed="true"
          disabled={removing}
          onClick={onUnlike}
        >
          <SystemIcon name="like" />
          <span>{mode === "list" ? `已赞 ${moment.likes}` : moment.likes}</span>
        </button>
        <button
          type="button"
          aria-label={`查看 ${moment.user} 动态的 ${moment.comments} 条评论`}
          onClick={onOpen}
        >
          <SystemIcon name="comment" />
          <span>{moment.comments}</span>
        </button>
        {mode === "list" ? (
          <button
            type="button"
            className="studioLikedMomentOpenAction"
            aria-label={`查看 ${moment.user} 的动态详情`}
            onClick={onOpen}
          >
            查看详情
            <SystemIcon name="chevronRight" size={16} />
          </button>
        ) : (
          <span className="studioLikedMomentHistoryLabel">
            <SystemIcon name="history" size={16} />
            已收进点赞历史
          </span>
        )}
      </footer>
    </article>
  );
}

function PrototypeLikedMomentsPage({
  width,
  height,
  theme,
  onBack,
  onBrowse,
  onOpenDetail,
}: {
  width: number;
  height: number;
  theme: "light" | "dark";
  onBack: () => void;
  onBrowse: () => void;
  onOpenDetail: () => void;
}) {
  const [moments, setMoments] = useState(LIKED_MOMENTS);
  const [selectedId, setSelectedId] = useState(LIKED_MOMENTS[0]?.id ?? "");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [lastRemoved, setLastRemoved] = useState<{
    moment: LikedMoment;
    index: number;
  } | null>(null);
  const removalTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const splitView = width >= 700;
  const selectedMoment =
    moments.find((moment) => moment.id === selectedId) ?? moments[0] ?? null;

  useEffect(
    () => () => {
      if (removalTimer.current) window.clearTimeout(removalTimer.current);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const openMoment = (id: string) => {
    if (splitView) {
      setSelectedId(id);
      return;
    }
    onOpenDetail();
  };

  const removeMoment = (id: string) => {
    if (removingId) return;
    const index = moments.findIndex((moment) => moment.id === id);
    const moment = moments[index];
    if (!moment) return;

    setRemovingId(id);
    removalTimer.current = window.setTimeout(() => {
      const remaining = moments.filter((item) => item.id !== id);
      setMoments(remaining);
      setSelectedId((current) =>
        current === id ? (remaining[0]?.id ?? "") : current,
      );
      setLastRemoved({ moment, index });
      setRemovingId(null);
      toastTimer.current = window.setTimeout(() => {
        setLastRemoved(null);
      }, 3000);
    }, 200);
  };

  const undoRemove = () => {
    if (!lastRemoved) return;
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setMoments((current) => {
      const restored = [...current];
      restored.splice(lastRemoved.index, 0, lastRemoved.moment);
      return restored;
    });
    setSelectedId(lastRemoved.moment.id);
    setLastRemoved(null);
  };

  return (
    <div
      className={[
        "pageCanvasDevice",
        "studioLikedMomentsDevice",
        splitView ? "studioLikedMomentsDevice--split" : "",
        "studioMomentCaptureDevice",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width, height }}
      data-theme={theme}
      data-capture-scene="liked-list"
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />
      <div className="studioLikedMomentsLayout">
        <section className="studioLikedMomentsMaster" aria-label="我赞过的动态">
          <RegularNavigation
            title="我赞过的"
            subtitle={`${moments.length} 条动态`}
            leading="back"
            onBack={onBack}
            ariaLabel="我赞过的动态导航"
          />
          <div className="studioLikedMomentsContext">
            <span className="studioLikedMomentsContextIcon" aria-hidden="true">
              <SystemIcon name="history" />
            </span>
            <span>
              <strong>按点赞时间排序</strong>
              <small>仅你可见，取消点赞后可立即撤销</small>
            </span>
          </div>
          <main className="studioLikedMomentsScroll">
            {moments.length === 0 ? (
              <EmptyState
                className="studioLikedMomentsEmpty"
                description="还没有赞过的动态"
                illustration="no-content"
                actionLabel="去看看动态"
                onAction={onBrowse}
                aria-label="我赞过的动态为空"
              />
            ) : (
              <div className="studioLikedMomentsList">
                {moments.map((moment) => (
                  <PrototypeLikedMomentCard
                    key={moment.id}
                    moment={moment}
                    mode="list"
                    selected={splitView && moment.id === selectedMoment?.id}
                    removing={removingId === moment.id}
                    onOpen={() => openMoment(moment.id)}
                    onUnlike={() => removeMoment(moment.id)}
                  />
                ))}
              </div>
            )}
          </main>
        </section>

        {splitView && selectedMoment ? (
          <aside
            className="studioLikedMomentsDetail"
            aria-label="已选动态详情"
            data-kit-gap="liked-moment-split-detail"
          >
            <RegularNavigation
              title="动态详情"
              leading="none"
              ariaLabel="已选动态详情导航"
            />
            <div className="studioLikedMomentsDetailScroll">
              <PrototypeLikedMomentCard
                moment={selectedMoment}
                mode="detail"
                removing={removingId === selectedMoment.id}
                onOpen={onOpenDetail}
                onUnlike={() => removeMoment(selectedMoment.id)}
              />
            </div>
          </aside>
        ) : null}
      </div>

      {lastRemoved ? (
        <div className="studioLikedMomentsToast">
          <Toast
            message="已从我赞过的移除"
            showChevron
            onPress={undoRemove}
            aria-label="已从我赞过的移除，点此撤销"
          />
        </div>
      ) : null}
    </div>
  );
}

function CoreFeedWithRegion({
  region,
  width,
  height,
  theme,
  captureScene,
  onOpenDetail,
  onOpenCompose,
  feedVariant = "default",
  onFeedBack,
}: {
  region: RegionMode;
  width: number;
  height: number;
  theme: "light" | "dark";
  captureScene: string;
  onOpenDetail?: () => void;
  onOpenCompose?: () => void;
  feedVariant?: "default" | "liked";
  onFeedBack?: () => void;
}) {
  return (
    <div
      className={[
        "studioMomentCoreFeedWrap",
        feedVariant === "liked" ? "studioMomentCoreFeedWrap--liked" : "",
        region === "closed" ? "studioMomentRegion--closed" : "studioMomentRegion--open",
        "studioMomentCaptureDevice",
      ]
        .filter(Boolean)
        .join(" ")}
      data-capture-scene={captureScene}
    >
      <PrototypeDestinationPage
        screen="feed"
        width={width}
        height={height}
        theme={theme}
        onNavigate={() => undefined}
        onOpenFeedDetail={onOpenDetail}
        onOpenCompose={onOpenCompose}
        feedVariant={feedVariant}
        onFeedBack={onFeedBack}
      />
    </div>
  );
}

/** Studio · 复用 Core Feed / Me(Profile) / 发布 / 详情，仅叠加页面缺口 */
export function StudioMomentLikedMentionPage({
  width = 375,
  height = 812,
  theme = "light",
  initialScene = "feed-structure",
  initialRegion = "closed",
}: StudioMomentLikedMentionPageProps) {
  const [scene, setScene] = useState<Scene>(initialScene);
  const [region, setRegion] = useState<RegionMode>(initialRegion);
  const [likedView, setLikedView] = useState<"profile" | "list" | "detail">(
    initialScene === "liked-list" ? "list" : "profile",
  );
  const [composeKey, setComposeKey] = useState(0);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionSelected, setMentionSelected] = useState<string[]>([]);
  const [composeMentionInsertion, setComposeMentionInsertion] = useState<{
    id: number;
    text: string;
  } | null>(null);
  const [commentMentionInsertion, setCommentMentionInsertion] = useState<{
    id: number;
    text: string;
  } | null>(null);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [revealedNotificationId, setRevealedNotificationId] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [status, setStatus] = useState("");

  const selectedNames = FRIENDS.filter((f) => mentionSelected.includes(f.id)).map(
    (f) => f.name,
  );

  const openMention = () => {
    setMentionQuery("");
    setMentionSelected([]);
    setMentionOpen(true);
  };

  const confirmMention = () => {
    const tokens = selectedNames.map((name) => `@${name}`).join(" ");
    if (scene === "compose-mention") {
      setComposeMentionInsertion({ id: Date.now(), text: tokens });
    } else if (scene === "comment-mention") {
      setCommentMentionInsertion({ id: Date.now(), text: tokens });
    }
    setMentionOpen(false);
    setMentionSelected([]);
    setStatus(`已 @ ${selectedNames.join("、")}`);
  };

  const toggleMentionFriend = (id: string) => {
    setMentionSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <div
      className="studioVoiceRoomStatusShell studioMomentLikedMentionShell"
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      data-theme={theme}
    >
      <div
        className="studioVoiceRoomStatusScenes studioMomentLikedMentionScenes"
        role="tablist"
        aria-label="动态优化交互场景"
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
            onClick={() => {
              setScene(item.id);
              setStatus("");
              setMentionOpen(false);
              if (item.id === "profile-liked") setLikedView("profile");
              if (item.id === "liked-list") setLikedView("list");
              if (item.id === "compose-mention") {
                saveFeedComposeDraft({
                  caption: "",
                  media: [],
                  audience: "everyone",
                });
                setComposeKey((value) => value + 1);
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {scene === "feed-structure" ? (
        <div className="studioMomentLikedRegionToggle" role="tablist">
          <button
            type="button"
            className={
              region === "closed"
                ? "studioMomentLikedRegionToggleBtn studioMomentLikedRegionToggleBtn--active"
                : "studioMomentLikedRegionToggleBtn"
            }
            onClick={() => setRegion("closed")}
          >
            非开放关系
          </button>
          <button
            type="button"
            className={
              region === "open"
                ? "studioMomentLikedRegionToggleBtn studioMomentLikedRegionToggleBtn--active"
                : "studioMomentLikedRegionToggleBtn"
            }
            onClick={() => setRegion("open")}
          >
            开放关系
          </button>
        </div>
      ) : null}

      {status ? (
        <p className="studioMomentLikedMentionStatus" role="status">
          {status}
        </p>
      ) : null}

      <div className="studioMomentDeviceStack">
        {scene === "feed-structure" ? (
          <CoreFeedWithRegion
            region={region}
            width={width}
            height={height}
            theme={theme}
            captureScene="feed-structure"
          />
        ) : null}

        {scene === "profile-liked" ? (
          <div
            className="studioMomentCaptureDevice"
            data-capture-scene="profile-liked"
          >
            <ProfilePagePrototype
              width={width}
              height={height}
              theme={theme}
              onBack={() => setScene("feed-structure")}
              likedMomentsCount={LIKED_MOMENTS.length}
              onOpenLikedMoments={() => {
                setLikedView("list");
                setScene("liked-list");
              }}
            />
          </div>
        ) : null}

        {scene === "liked-list" ? (
          likedView === "detail" ? (
            <div
              className={`studioMomentDetail studioMomentDetail--${
                region === "closed" ? "closed-region" : "stranger"
              }`}
            >
              <FeedDetailPagePrototype
                width={width}
                height={height}
                theme={theme}
                onBack={() => setLikedView("list")}
              />
            </div>
          ) : (
            <PrototypeLikedMomentsPage
              width={width}
              height={height}
              theme={theme}
              onBack={() => {
                setScene("profile-liked");
                setLikedView("profile");
              }}
              onBrowse={() => {
                setScene("feed-structure");
                setLikedView("profile");
              }}
              onOpenDetail={() => {
                setLikedView("detail");
              }}
            />
          )
        ) : null}

        {scene === "compose-mention" ? (
          <div
            className="studioMomentCaptureDevice"
            data-capture-scene="compose-mention"
          >
            <FeedComposePagePrototype
              key={composeKey}
              width={width}
              height={height}
              theme={theme}
              onBack={() => setScene("feed-structure")}
              onPublished={() => {
                setStatus("动态已发布（Core 发布器）");
                setScene("feed-structure");
              }}
              onMention={openMention}
              mentionInsertion={composeMentionInsertion ?? undefined}
            />
          </div>
        ) : null}

        {scene === "comment-mention" ? (
          <div
            className={`studioMomentDetail studioMomentDetail--stranger studioMomentCaptureDevice`}
            data-capture-scene="comment-mention"
          >
            <FeedDetailPagePrototype
              width={width}
              height={height}
              theme={theme}
              onBack={() => setScene("feed-structure")}
              onMention={openMention}
              mentionInsertion={commentMentionInsertion ?? undefined}
            />
          </div>
        ) : null}

        {scene === "notifications" ? (
          <div
            className="pageCanvasDevice studioMomentLikedDevice studioMomentCaptureDevice"
            style={{ width, height }}
            data-capture-scene="notifications"
          >
            <IosStatusBar
              appearance={theme === "dark" ? "light-content" : "dark-content"}
            />
            <RegularNavigation
              title="动态通知"
              leading="back"
              onBack={() => setScene("feed-structure")}
              trailingKind="text"
              trailing={
                notifications.length > 0 ? (
                  <button
                    type="button"
                    className="studioMomentClearAll"
                    onClick={() => setClearDialogOpen(true)}
                  >
                    清空
                  </button>
                ) : null
              }
            />
            <main className="prototypeDestinationScroll">
              {notifications.length === 0 ? (
                <p className="studioMomentNotifyEmpty">No notifications yet</p>
              ) : (
                notifications.map((item) => {
                  const revealed = revealedNotificationId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`studioMomentNotifyRow${revealed ? " studioMomentNotifyRow--revealed" : ""}`}
                      data-kit-gap="notification-swipe-action"
                      onTouchStart={(event) => {
                        touchStartX.current = event.touches[0]?.clientX ?? null;
                      }}
                      onTouchEnd={(event) => {
                        const endX = event.changedTouches[0]?.clientX;
                        if (touchStartX.current === null || endX === undefined) return;
                        const delta = endX - touchStartX.current;
                        if (delta < -40) setRevealedNotificationId(item.id);
                        if (delta > 40) setRevealedNotificationId(null);
                        touchStartX.current = null;
                      }}
                    >
                      <RegularListItem
                        listType="message"
                        title={item.title}
                        subtitle={item.time}
                        leading={<AvatarVisual size={40} src={item.avatar} alt="" />}
                        trailing={
                          <span className="studioMomentNotifyTrailing">
                            <span className="studioMomentNotificationThumb" aria-hidden="true" />
                            <button
                              type="button"
                              className="studioMomentNotifyMore"
                              aria-label={`${item.title}的更多操作`}
                              aria-expanded={revealed}
                              onClick={() => setRevealedNotificationId(revealed ? null : item.id)}
                            >
                              <SystemIcon name="more" size={20} />
                            </button>
                          </span>
                        }
                        onPress={() => setStatus(`打开通知：${item.title}`)}
                      />
                      {revealed ? (
                        <button
                          type="button"
                          className="studioMomentNotifyDeleteAction"
                          aria-label={`删除通知：${item.title}`}
                          onClick={() => {
                            setNotifications((current) => current.filter((entry) => entry.id !== item.id));
                            setRevealedNotificationId(null);
                            setStatus("已删除通知");
                          }}
                        >
                          删除
                        </button>
                      ) : null}
                    </div>
                  );
                })
              )}
            </main>
            <CenterDialog
              open={clearDialogOpen}
              title="清空全部通知？"
              description="清空后无法恢复。"
              className="studioMomentClearDialog"
              dismissible
              onDismiss={() => setClearDialogOpen(false)}
              actions={[
                {
                  id: "cancel",
                  label: "取消",
                  tone: "neutral",
                  onPress: () => setClearDialogOpen(false),
                },
                {
                  id: "clear",
                  label: "清空",
                  tone: "destructive",
                  onPress: () => {
                    setNotifications([]);
                    setRevealedNotificationId(null);
                    setClearDialogOpen(false);
                    setStatus("已清空全部通知");
                  },
                },
              ]}
            />
          </div>
        ) : null}
        <MentionPickerSheet
          open={mentionOpen}
          query={mentionQuery}
          selectedIds={mentionSelected}
          onQueryChange={setMentionQuery}
          onToggle={toggleMentionFriend}
          onClose={() => setMentionOpen(false)}
          onConfirm={confirmMention}
        />
      </div>
    </div>
  );
}
