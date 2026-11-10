"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { BottomNavigation } from "@/components/kit/bottom-navigation";
import { CenterDialog } from "@/components/kit/center-dialog";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { ListTag } from "@/components/kit/list-tag";
import { RegularListItem } from "@/components/kit/regular-list-item";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { SearchControl } from "@/components/kit/search-control";
import { SystemIcon } from "@/components/kit/system-icon";
import { TextSecondaryTab } from "@/components/kit/text-secondary-tab";
import { Toast } from "@/components/kit/toast";
import { UnderlineSecondaryTab } from "@/components/kit/underline-secondary-tab";
import type { BottomNavKey } from "@/lib/profile-prototype-model";

type TopicScene =
  | "mine-recommend"
  | "search"
  | "search-suggestions"
  | "topic-detail"
  | "post-menu"
  | "unfollow-dialog"
  | "mine-my-topics"
  | "mine-empty-topics";

type MineTab = "recommend" | "following" | "my-topics";
type TopicSortTab = "recommend" | "latest";

const SCENES: Array<{ id: TopicScene; label: string }> = [
  { id: "mine-recommend", label: "Mine · 推荐" },
  { id: "search", label: "搜索话题" },
  { id: "search-suggestions", label: "搜索联想" },
  { id: "topic-detail", label: "话题详情" },
  { id: "post-menu", label: "帖子操作" },
  { id: "unfollow-dialog", label: "取消关注" },
  { id: "mine-my-topics", label: "我的话题" },
  { id: "mine-empty-topics", label: "无关注话题" },
];

const MINE_TABS_TWO = [
  { key: "recommend", label: "推荐" },
  { key: "following", label: "关注" },
] as const;

const MINE_TABS_THREE = [
  { key: "recommend", label: "推荐" },
  { key: "following", label: "关注" },
  { key: "my-topics", label: "我的话题" },
] as const;

const TOPIC_SORT_TABS = [
  { key: "recommend", label: "推荐" },
  { key: "latest", label: "最新" },
] as const;

const HOT_SEARCHES = ["OOTD", "穿搭", "健身打卡", "美食分享", "旅行日记"] as const;

const SUGGESTED_TOPICS = [
  { id: "aotd", name: "AOTD" },
  { id: "ootd", name: "OOTD" },
  { id: "pootd", name: "POOTD" },
  { id: "fitness", name: "健身打卡" },
] as const;

const FOLLOW_SUGGESTIONS = [
  { id: "aotd", name: "AOTD" },
  { id: "ootd", name: "OOTD" },
  { id: "travel", name: "旅行日记" },
  { id: "food", name: "美食分享" },
] as const;

const FEED_POSTS = [
  {
    id: "latifa",
    user: "Latifa",
    avatar: "/prototypes/feed/latifa-avatar.png",
    gender: "female" as const,
    age: 28,
    level: 10 as const,
    caption:
      "在这里你可以分享你的穿搭，一起来晒出今日造型。#OOTD",
    media: "/prototypes/feed/latifa-photo.png",
    likes: "19",
    comments: "25",
  },
  {
    id: "andrew",
    user: "Andrew",
    avatar: "/prototypes/feed/andrew-avatar.png",
    gender: "male" as const,
    age: 26,
    level: 9 as const,
    caption:
      "I'm 180 cm tall. I enjoy fitness and swimming. Come and chat with me.",
    media: "/prototypes/feed/latifa-photo.png",
    likes: "12",
    comments: "8",
  },
] as const;

const TOPIC_DESCRIPTION =
  "在这里你可以分享你的穿搭，一起来晒出今日造型，发现更多灵感与好友。";

type StudioTopicDiscoveryPageProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack?: () => void;
};

/** Studio-only · Mine 话题发现、搜索、详情与关注流程 */
export function StudioTopicDiscoveryPage({
  width = 375,
  height = 812,
  theme = "light",
  onBack,
}: StudioTopicDiscoveryPageProps) {
  const [scene, setScene] = useState<TopicScene>("mine-recommend");
  const [mineTab, setMineTab] = useState<MineTab>("recommend");
  const [topicSort, setTopicSort] = useState<TopicSortTab>("recommend");
  const [query, setQuery] = useState("OO");
  const [topicFollowed, setTopicFollowed] = useState(true);
  const [followedTopicIds, setFollowedTopicIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const suggestions = useMemo(() => {
    const base = query.trim().toUpperCase() || "OO";
    return Array.from(
      new Set([
        `#${base}TD`,
        "#OOTD",
        "#AOTD",
        "#POOTD",
        `#${base} 穿搭`,
      ]),
    );
  }, [query]);

  const openSearch = () => {
    setQuery("");
    setScene("search");
  };

  const openTopicDetail = () => setScene("topic-detail");

  const toggleTopicFollow = () => {
    if (topicFollowed) {
      setScene("unfollow-dialog");
      return;
    }
    setTopicFollowed(true);
    setFollowedTopicIds((current) =>
      current.includes("ootd") ? current : [...current, "ootd"],
    );
    setToast("已关注话题");
  };

  const confirmUnfollow = () => {
    setTopicFollowed(false);
    setFollowedTopicIds((current) => current.filter((id) => id !== "ootd"));
    setScene("topic-detail");
    setToast("已取消关注话题");
  };

  const followSuggestion = (topicId: string, topicName: string) => {
    setFollowedTopicIds((current) =>
      current.includes(topicId) ? current : [...current, topicId],
    );
    setToast(`已关注 #${topicName}`);
  };

  const renderScene = () => {
    switch (scene) {
      case "mine-recommend":
        return (
          <MineFeedScene
            width={width}
            height={height}
            theme={theme}
            mineTab={mineTab}
            tabs={MINE_TABS_TWO}
            bottomNav="feed"
            showSearch
            onMineTabChange={setMineTab}
            onSearch={openSearch}
            onOpenTopic={openTopicDetail}
          />
        );
      case "search":
        return (
          <TopicSearchScene
            width={width}
            height={height}
            theme={theme}
            query=""
            onBack={onBack ?? (() => setScene("mine-recommend"))}
            onQueryChange={(value) => {
              setQuery(value);
              if (value.trim()) setScene("search-suggestions");
            }}
            onSelectHot={(value) => {
              setQuery(value);
              openTopicDetail();
            }}
          />
        );
      case "search-suggestions":
        return (
          <TopicSearchScene
            width={width}
            height={height}
            theme={theme}
            query={query}
            suggestions={suggestions}
            onBack={onBack ?? (() => setScene("search"))}
            onQueryChange={setQuery}
            onSelectSuggestion={(value) => {
              setQuery(value.replace(/^#/, ""));
              openTopicDetail();
            }}
          />
        );
      case "topic-detail":
        return (
          <TopicDetailScene
            width={width}
            height={height}
            theme={theme}
            followed={topicFollowed}
            sortTab={topicSort}
            onBack={onBack ?? (() => setScene("mine-recommend"))}
            onSortChange={setTopicSort}
            onToggleFollow={toggleTopicFollow}
            onPostMenu={() => setScene("post-menu")}
            onParticipate={() => setToast("打开参与话题发布器")}
          />
        );
      case "post-menu":
        return (
          <TopicDetailScene
            width={width}
            height={height}
            theme={theme}
            followed={topicFollowed}
            sortTab={topicSort}
            showPostMenu
            onBack={onBack ?? (() => setScene("topic-detail"))}
            onSortChange={setTopicSort}
            onToggleFollow={toggleTopicFollow}
            onPostMenu={() => undefined}
            onPinPost={() => {
              setScene("topic-detail");
              setToast("帖子已置顶");
            }}
            onReportPost={() => {
              setScene("topic-detail");
              setToast("已提交举报");
            }}
            onParticipate={() => setToast("打开参与话题发布器")}
          />
        );
      case "unfollow-dialog":
        return (
          <TopicDetailScene
            width={width}
            height={height}
            theme={theme}
            followed={topicFollowed}
            sortTab={topicSort}
            showUnfollowDialog
            onBack={onBack ?? (() => setScene("topic-detail"))}
            onSortChange={setTopicSort}
            onToggleFollow={toggleTopicFollow}
            onDismissUnfollow={() => setScene("topic-detail")}
            onConfirmUnfollow={confirmUnfollow}
            onPostMenu={() => setScene("post-menu")}
            onParticipate={() => setToast("打开参与话题发布器")}
          />
        );
      case "mine-my-topics":
        return (
          <MineFeedScene
            width={width}
            height={height}
            theme={theme}
            mineTab="my-topics"
            tabs={MINE_TABS_THREE}
            bottomNav="me"
            topicFollowed
            onMineTabChange={setMineTab}
            onSearch={openSearch}
            onOpenTopic={openTopicDetail}
          />
        );
      case "mine-empty-topics":
        return (
          <MineEmptyTopicsScene
            width={width}
            height={height}
            theme={theme}
            followedIds={followedTopicIds}
            onMineTabChange={setMineTab}
            onFollow={followSuggestion}
            onSearch={openSearch}
            onCompose={() => setToast("打开话题发现")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="studioVoiceRoomStatusShell studioTopicDiscoveryShell"
      style={{ "--page-canvas-width": `${width}px` } as CSSProperties}
    >
      <div
        className="studioVoiceRoomStatusScenes"
        role="tablist"
        aria-label="话题发现原型场景"
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
            onClick={() => setScene(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {renderScene()}

      {toast ? <Toast message={toast} /> : null}
    </div>
  );
}

function TopicDeviceFrame({
  width,
  height,
  theme,
  bottomNav,
  children,
  className,
}: {
  width: number;
  height: number;
  theme: "light" | "dark";
  bottomNav?: BottomNavKey;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "pageCanvasDevice",
        "studioTopicDiscoveryDevice",
        theme === "dark" ? "studioTopicDiscoveryDevice--dark" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />
      <div className="pageCanvasContentShell">{children}</div>
      {bottomNav ? (
        <BottomNavigation value={bottomNav} onChange={() => undefined} />
      ) : null}
    </div>
  );
}

function MineFeedScene({
  width,
  height,
  theme,
  mineTab,
  tabs,
  bottomNav,
  showSearch,
  topicFollowed,
  onMineTabChange,
  onSearch,
  onOpenTopic,
}: {
  width: number;
  height: number;
  theme: "light" | "dark";
  mineTab: MineTab;
  tabs: typeof MINE_TABS_TWO | typeof MINE_TABS_THREE;
  bottomNav: BottomNavKey;
  showSearch?: boolean;
  topicFollowed?: boolean;
  onMineTabChange: (tab: MineTab) => void;
  onSearch: () => void;
  onOpenTopic: () => void;
}) {
  return (
    <TopicDeviceFrame width={width} height={height} theme={theme} bottomNav={bottomNav}>
      <header className="studioTopicMineHeader">
        <div className="studioTopicMineHeaderRow">
          <h1 className="studioTopicMineTitle">Mine</h1>
          {showSearch ? (
            <button
              type="button"
              className="studioTopicMineSearch"
              aria-label="打开话题搜索"
              onClick={onSearch}
            >
              <SystemIcon name="search" size={24} />
            </button>
          ) : null}
        </div>
        <TextSecondaryTab
          className="studioTopicMineTabs"
          items={[...tabs]}
          value={mineTab}
          onChange={(value) => onMineTabChange(value as MineTab)}
          ariaLabel="Mine 话题分类"
          capitalizeInactive={false}
        />
      </header>
      <main className="prototypeDestinationScroll prototypeFeedScroll studioTopicFeedScroll">
        <section className="prototypeFeedList" aria-label="话题动态">
          {FEED_POSTS.map((post) => (
            <PrototypeTopicFeedCard
              key={post.id}
              post={post}
              topicFollowed={topicFollowed}
              onOpenTopic={onOpenTopic}
            />
          ))}
        </section>
      </main>
    </TopicDeviceFrame>
  );
}

function MineEmptyTopicsScene({
  width,
  height,
  theme,
  followedIds,
  onMineTabChange,
  onFollow,
  onSearch,
  onCompose,
}: {
  width: number;
  height: number;
  theme: "light" | "dark";
  followedIds: string[];
  onMineTabChange: (tab: MineTab) => void;
  onFollow: (topicId: string, topicName: string) => void;
  onSearch: () => void;
  onCompose: () => void;
}) {
  return (
    <TopicDeviceFrame width={width} height={height} theme={theme} bottomNav="me">
      <header className="studioTopicMineHeader">
        <div className="studioTopicMineHeaderRow">
          <h1 className="studioTopicMineTitle">Mine</h1>
          <button
            type="button"
            className="studioTopicMineSearch"
            aria-label="打开话题搜索"
            onClick={onSearch}
          >
            <SystemIcon name="search" size={24} />
          </button>
        </div>
        <TextSecondaryTab
          className="studioTopicMineTabs"
          items={[...MINE_TABS_THREE]}
          value="my-topics"
          onChange={(value) => onMineTabChange(value as MineTab)}
          ariaLabel="Mine 话题分类"
          capitalizeInactive={false}
        />
      </header>
      <main className="studioTopicEmptyScroll" aria-label="我的话题空状态">
        <div className="studioTopicEmptyState">
          <SystemIcon name="hashtag" size={40} />
          <strong>暂无关注话题</strong>
          <p>关注感兴趣的话题，第一时间看到相关内容。</p>
        </div>
        <section className="studioTopicSuggestionSection" aria-labelledby="topic-suggest-title">
          <h2 id="topic-suggest-title">推荐话题</h2>
          <div className="studioTopicSuggestionList" role="list">
            {FOLLOW_SUGGESTIONS.map((topic) => {
              const followed = followedIds.includes(topic.id);
              return (
                <RegularListItem
                  key={topic.id}
                  listType="action"
                  title={`#${topic.name}`}
                  ariaLabel={`${followed ? "已关注" : "关注"} #${topic.name}`}
                  leading={<SystemIcon name="hashtag" size={20} />}
                  trailing={
                    followed ? (
                      <span className="studioTopicFollowedBadge">已关注</span>
                    ) : (
                      <span className="studioTopicFollowAction" aria-hidden="true">
                        <SystemIcon name="follow" size={20} />
                      </span>
                    )
                  }
                  onPress={() => {
                    if (!followed) onFollow(topic.id, topic.name);
                  }}
                />
              );
            })}
          </div>
        </section>
      </main>
      <button
        type="button"
        className="prototypeFeedCompose studioTopicComposeFab"
        aria-label="发现更多话题"
        onClick={onCompose}
      >
        <span>
          <SystemIcon name="publish" />
        </span>
      </button>
    </TopicDeviceFrame>
  );
}

function TopicSearchScene({
  width,
  height,
  theme,
  query,
  suggestions,
  onBack,
  onQueryChange,
  onSelectHot,
  onSelectSuggestion,
}: {
  width: number;
  height: number;
  theme: "light" | "dark";
  query: string;
  suggestions?: string[];
  onBack: () => void;
  onQueryChange: (value: string) => void;
  onSelectHot?: (value: string) => void;
  onSelectSuggestion?: (value: string) => void;
}) {
  return (
    <TopicDeviceFrame
      width={width}
      height={height}
      theme={theme}
      className="studioTopicSearchDevice"
    >
      <header className="prototypeSearchHeader">
        <SearchControl
          value={query}
          active
          autoFocus
          ariaLabel="搜索话题"
          placeholder="搜索话题"
          onActivate={() => undefined}
          onChange={onQueryChange}
          onCancel={onBack}
          onSubmit={(value) => onSelectSuggestion?.(`#${value.trim()}`)}
        />
      </header>
      <main className="prototypeSearchScroll studioTopicSearchScroll">
        {suggestions?.length ? (
          <section
            className="prototypeSearchSection"
            aria-labelledby="topic-suggestion-title"
          >
            <div className="studioTopicSuggestionList" role="list">
              {suggestions.map((suggestion, index) => (
                <RegularListItem
                  key={`${suggestion}-${index}`}
                  listType="action"
                  title={suggestion}
                  ariaLabel={`搜索 ${suggestion}`}
                  leading={<SystemIcon name="search" size={20} />}
                  onPress={() => onSelectSuggestion?.(suggestion)}
                />
              ))}
            </div>
          </section>
        ) : (
          <section
            className="prototypeSearchSection prototypeSearchRecent"
            aria-labelledby="hot-search-title"
          >
            <div className="prototypeSearchSectionHeader">
              <h2 id="hot-search-title">热门搜索</h2>
            </div>
            <div className="prototypeSearchChips studioTopicHotChips">
              {HOT_SEARCHES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onSelectHot?.(item)}
                >
                  <SystemIcon name="hashtag" size={16} />
                  {item}
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </TopicDeviceFrame>
  );
}

function TopicDetailScene({
  width,
  height,
  theme,
  followed,
  sortTab,
  showPostMenu,
  showUnfollowDialog,
  onBack,
  onSortChange,
  onToggleFollow,
  onDismissUnfollow,
  onConfirmUnfollow,
  onPostMenu,
  onPinPost,
  onReportPost,
  onParticipate,
}: {
  width: number;
  height: number;
  theme: "light" | "dark";
  followed: boolean;
  sortTab: TopicSortTab;
  showPostMenu?: boolean;
  showUnfollowDialog?: boolean;
  onBack: () => void;
  onSortChange: (tab: TopicSortTab) => void;
  onToggleFollow: () => void;
  onDismissUnfollow?: () => void;
  onConfirmUnfollow?: () => void;
  onPostMenu: () => void;
  onPinPost?: () => void;
  onReportPost?: () => void;
  onParticipate: () => void;
}) {
  return (
    <TopicDeviceFrame width={width} height={height} theme={theme} bottomNav="feed">
      <RegularNavigation
        title="# OOTD"
        leading="back"
        onBack={onBack}
        trailing={
          <button
            type="button"
            className={[
              "kitButton",
              "kitButton--height32",
              followed ? "kitButton--neutral" : "kitButton--primary",
              "studioTopicFollowButton",
            ].join(" ")}
            aria-pressed={followed}
            onClick={onToggleFollow}
          >
            {followed ? "已关注" : "关注话题"}
          </button>
        }
        trailingKind="button"
        ariaLabel="话题详情导航"
      />
      <p className="studioTopicDescription">{TOPIC_DESCRIPTION}</p>
      <UnderlineSecondaryTab
        items={TOPIC_SORT_TABS}
        value={sortTab}
        onChange={(value) => onSortChange(value as TopicSortTab)}
        ariaLabel="话题内容分类"
        className="studioTopicSortTabs"
      />
      <main className="prototypeDestinationScroll prototypeFeedScroll studioTopicFeedScroll">
        <section className="prototypeFeedList studioTopicDetailFeed" aria-label="话题动态">
          {FEED_POSTS.map((post, index) => (
            <div key={post.id} className="studioTopicPostWrap">
              <PrototypeTopicFeedCard
                post={post}
                showTopicTag={false}
                onMore={index === 0 ? onPostMenu : undefined}
              />
              {showPostMenu && index === 0 ? (
                <div
                  className="studioTopicPostMenu"
                  role="menu"
                  aria-label="帖子操作"
                >
                  <button type="button" role="menuitem" onClick={onPinPost}>
                    置顶
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="studioTopicPostMenu--destructive"
                    onClick={onReportPost}
                  >
                    举报
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </section>
      </main>
      <button
        type="button"
        className="studioTopicParticipateFab"
        aria-label="参与话题"
        onClick={onParticipate}
      >
        <SystemIcon name="publish" size={20} />
        <span>参与话题</span>
      </button>

      <CenterDialog
        open={Boolean(showUnfollowDialog)}
        title="是否取消关注话题？"
        dismissible
        onDismiss={onDismissUnfollow}
        actions={[
          {
            id: "cancel",
            label: "取消",
            tone: "neutral",
            onPress: onDismissUnfollow,
          },
          {
            id: "confirm",
            label: "确定",
            tone: "primary",
            onPress: onConfirmUnfollow,
          },
        ]}
        aria-label="取消关注话题确认"
      />
    </TopicDeviceFrame>
  );
}

function PrototypeTopicFeedCard({
  post,
  topicFollowed,
  showTopicTag = true,
  onOpenTopic,
  onMore,
}: {
  post: (typeof FEED_POSTS)[number];
  topicFollowed?: boolean;
  showTopicTag?: boolean;
  onOpenTopic?: () => void;
  onMore?: () => void;
}) {
  return (
    <article className="prototypeFeedCard">
      <header className="prototypeFeedAuthor">
        <AvatarVisual size={48} src={post.avatar} alt="" />
        <div className="prototypeFeedIdentity">
          <strong>{post.user}</strong>
          <span className="prototypeFeedTags" aria-label={`${post.age} 岁`}>
            <ListTag kind="gender" gender={post.gender} age={post.age} />
            <ListTag kind="membership" level={post.level} />
          </span>
        </div>
        <button
          className="prototypeFeedMore"
          type="button"
          aria-label={`更多 ${post.user}`}
          onClick={onMore}
        >
          <SystemIcon name="more" />
        </button>
      </header>
      <div className="prototypeFeedBody">
        <button
          type="button"
          className="prototypeFeedOpenDetail"
          aria-label={`查看 ${post.user} 的动态`}
          onClick={onOpenTopic}
        >
          <p className="prototypeFeedCaption">
            {showTopicTag ? <mark>#OOTD </mark> : null}
            {post.caption}
          </p>
          <span className="prototypeFeedMedia">
            <Image
              src={post.media}
              alt={`${post.user} 的动态照片`}
              width={180}
              height={180}
            />
          </span>
          <time className="prototypeFeedTime">23 minutes ago</time>
        </button>
        {topicFollowed ? (
          <div className="studioTopicInlineFollow">
            <button type="button" className="studioTopicInlineFollowButton" disabled>
              <SystemIcon name="followed" size={16} />
              已关注
            </button>
          </div>
        ) : null}
        <div className="prototypeFeedActions">
          <div>
            <button
              type="button"
              aria-label={`喜欢 ${post.user} 的动态`}
            >
              <SystemIcon name="like" />
              {post.likes ? <span>{post.likes}</span> : null}
            </button>
            <button
              type="button"
              aria-label={`评论 ${post.user} 的动态`}
              onClick={onOpenTopic}
            >
              <SystemIcon name="comment" />
              {post.comments ? <span>{post.comments}</span> : null}
            </button>
          </div>
          <button
            className="prototypeFeedChat"
            type="button"
            aria-label={`与 ${post.user} 聊天`}
          >
            <SystemIcon name="chat" />
            Chat
          </button>
        </div>
      </div>
    </article>
  );
}
