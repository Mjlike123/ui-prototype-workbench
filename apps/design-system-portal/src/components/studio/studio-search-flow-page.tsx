"use client";

import Image from "next/image";
import { useMemo, useState, type CSSProperties } from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { ListTag } from "@/components/kit/list-tag";
import { RegularListItem } from "@/components/kit/regular-list-item";
import { SearchControl } from "@/components/kit/search-control";
import { SystemIcon } from "@/components/kit/system-icon";
import { TextSecondaryTab } from "@/components/kit/text-secondary-tab";
import { SearchPagePrototype } from "@/components/prototypes/search-page-prototype";

type SearchStage = "discover" | "suggestions" | "results";
type ResultTab = "top" | "moments" | "users" | "rooms" | "games";

const RESULT_TABS = [
  { key: "top", label: "Top" },
  { key: "moments", label: "Moments" },
  { key: "users", label: "Users" },
  { key: "rooms", label: "Rooms" },
  { key: "games", label: "Games" },
] as const;

const PEOPLE = [
  {
    name: "Cassie",
    id: "TOP 827419",
    avatar: "/prototypes/toptop-home/avatar-cassie.png",
    gender: "female" as const,
    age: 28,
    level: 10 as const,
  },
  {
    name: "Andrew",
    id: "TOP 653028",
    avatar: "/prototypes/toptop-home/avatar-andrew.png",
    gender: "male" as const,
    age: 26,
    level: 9 as const,
  },
];

const GAMES = [
  {
    name: "Jackaroo",
    image: "/prototypes/toptop-home/game-jackaroo-v2.png",
  },
  {
    name: "Carrom",
    image: "/prototypes/toptop-home/game-carrom-v2.png",
  },
] as const;

export function StudioSearchFlowPage({
  width = 375,
  height = 812,
  theme = "light",
  onBack,
}: {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack?: () => void;
}) {
  const [stage, setStage] = useState<SearchStage>("discover");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<ResultTab>("top");
  const [feedback, setFeedback] = useState("");

  const submit = (value: string) => {
    const next = value.trim();
    if (!next) return;
    setQuery(next);
    setStage("results");
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      setStage("suggestions");
    }
  };

  if (stage === "discover") {
    return (
      <SearchPagePrototype
        width={width}
        height={height}
        theme={theme}
        onBack={onBack ?? (() => undefined)}
        onQueryChange={changeQuery}
        onSubmit={submit}
      />
    );
  }

  return (
    <div
      className="pageCanvasDevice prototypeSearchDevice studioSearchFlowDevice"
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`TopTop 搜索优化 · ${width}×${height}`}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />
      <header className="prototypeSearchHeader">
        <SearchControl
          value={query}
          active
          ariaLabel="TopTop 全局搜索"
          placeholder="Search people, rooms, moments or games"
          onActivate={() => undefined}
          onChange={changeQuery}
          onCancel={() => {
            setQuery("");
            setStage("discover");
          }}
          onSubmit={submit}
        />
      </header>

      {stage === "suggestions" ? (
        <SearchSuggestions query={query} onSelect={submit} />
      ) : (
        <>
          <TextSecondaryTab
            className="studioSearchResultTabs"
            items={RESULT_TABS}
            value={tab}
            onChange={(value) => setTab(value as ResultTab)}
            ariaLabel="搜索结果分类"
            capitalizeInactive={false}
          />
          <main className="prototypeSearchScroll studioSearchResults">
            <SearchResults
              query={query}
              tab={tab}
              onRelated={submit}
              onFeedback={setFeedback}
            />
          </main>
        </>
      )}

      {feedback ? (
        <output className="profilePrototypeToast" aria-live="polite">
          {feedback}
        </output>
      ) : null}
    </div>
  );
}

function SearchSuggestions({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (value: string) => void;
}) {
  const suggestions = useMemo(() => {
    const base = query.trim() || "summer";
    return [
      base,
      `${base} rooms`,
      `${base} moments`,
      `${base} people`,
      `${base} games`,
      `${base} friends`,
    ];
  }, [query]);

  return (
    <main className="prototypeSearchScroll studioSearchSuggestionScroll">
      <section className="prototypeSearchSection" aria-labelledby="suggestions-title">
        <div className="prototypeSearchSectionHeader">
          <h2 id="suggestions-title">Suggestions</h2>
          <span>{suggestions.length}</span>
        </div>
        <div className="studioSearchSuggestionList" role="list">
          {suggestions.map((suggestion, index) => (
            <RegularListItem
              key={suggestion}
              listType="action"
              title={suggestion}
              ariaLabel={`搜索 ${suggestion}`}
              leading={<SystemIcon name="search" size={20} />}
              trailing={
                <span className="studioSearchSuggestionAction">
                  {index === 0 ? "Search" : <SystemIcon name="reply" size={18} />}
                </span>
              }
              onPress={() => onSelect(suggestion)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function SearchResults({
  query,
  tab,
  onRelated,
  onFeedback,
}: {
  query: string;
  tab: ResultTab;
  onRelated: (query: string) => void;
  onFeedback: (message: string) => void;
}) {
  const showMoments = tab === "top" || tab === "moments";
  const showUsers = tab === "top" || tab === "users";
  const showRooms = tab === "top" || tab === "rooms";
  const showGames = tab === "top" || tab === "games";

  return (
    <>
      {tab === "top" ? (
        <section className="studioSearchHighlight" aria-labelledby="search-highlight-title">
          <span>Search highlights</span>
          <h2 id="search-highlight-title">{query}</h2>
          <p>
            Explore the most relevant people, active rooms, Moments and games
            across TopTop.
          </p>
        </section>
      ) : null}

      {showMoments ? (
        <section className="prototypeSearchSection" aria-labelledby="moment-results-title">
          <div className="prototypeSearchSectionHeader">
            <h2 id="moment-results-title">Moments</h2>
            <button type="button" onClick={() => onFeedback("打开全部 Moments")}>
              See all
            </button>
          </div>
          <div className="studioSearchMomentGrid">
            {[
              {
                image: "/prototypes/feed/latifa-photo.png",
                caption: `${query} · Morning inspiration`,
              },
              {
                image: "/prototypes/feed/andrew-avatar.png",
                caption: `${query} · People are talking`,
              },
            ].map((moment) => (
              <button
                type="button"
                key={moment.caption}
                onClick={() => onFeedback(`打开 ${moment.caption}`)}
              >
                <Image src={moment.image} alt="" width={164} height={164} />
                <strong>{moment.caption}</strong>
                <small>23 minutes ago</small>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {showUsers ? (
        <section className="prototypeSearchSection" aria-labelledby="user-results-title">
          <div className="prototypeSearchSectionHeader">
            <h2 id="user-results-title">Users</h2>
            <span>2</span>
          </div>
          <div className="prototypeSearchPeopleList" role="list">
            {PEOPLE.map((person) => (
              <RegularListItem
                key={person.id}
                listType="message"
                title={person.name}
                subtitle={person.id}
                ariaLabel={`打开 ${person.name} 的个人资料`}
                leading={<AvatarVisual size={48} src={person.avatar} alt="" />}
                tags={
                  <>
                    <ListTag kind="membership" level={person.level} />
                    <ListTag
                      kind="gender"
                      gender={person.gender}
                      age={person.age}
                    />
                  </>
                }
                onPress={() => onFeedback(`打开 ${person.name} 的个人资料`)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {showRooms ? (
        <section className="prototypeSearchSection" aria-labelledby="room-results-title">
          <div className="prototypeSearchSectionHeader">
            <h2 id="room-results-title">Rooms</h2>
            <span>2</span>
          </div>
          <div className="prototypeSearchPeopleList" role="list">
            <RegularListItem
              listType="message"
              title={`${query} Talk`}
              subtitle="1.2K online · Voice room"
              leading={
                <AvatarVisual
                  size={48}
                  src="/prototypes/toptop-home/friend-avatar.png"
                  alt=""
                />
              }
              onPress={() => onFeedback(`进入 ${query} Talk`)}
            />
            <RegularListItem
              listType="message"
              title="Friends hangout"
              subtitle="328 online · Social room"
              leading={
                <AvatarVisual
                  size={48}
                  src="/prototypes/toptop-home/avatar-estelle.png"
                  alt=""
                />
              }
              onPress={() => onFeedback("进入 Friends hangout")}
            />
          </div>
        </section>
      ) : null}

      {showGames ? (
        <section className="prototypeSearchSection" aria-labelledby="game-results-title">
          <div className="prototypeSearchSectionHeader">
            <h2 id="game-results-title">Games</h2>
            <span>2</span>
          </div>
          <div className="prototypeSearchGameGrid">
            {GAMES.map((game) => (
              <button
                key={game.name}
                type="button"
                onClick={() => onFeedback(`启动 ${game.name}`)}
              >
                <Image src={game.image} alt="" width={160} height={96} />
                <strong>{game.name}</strong>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="prototypeSearchSection studioSearchRelated" aria-labelledby="related-title">
        <div className="prototypeSearchSectionHeader">
          <h2 id="related-title">Related searches</h2>
        </div>
        <div className="prototypeSearchChips">
          {[`${query} friends`, `${query} live`, `${query} games`, "Popular now"].map(
            (item) => (
              <button type="button" key={item} onClick={() => onRelated(item)}>
                <SystemIcon name="search" size={16} />
                {item}
              </button>
            ),
          )}
        </div>
      </section>
    </>
  );
}
