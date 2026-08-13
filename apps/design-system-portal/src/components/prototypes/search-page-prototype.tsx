"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { ListTag, type MembershipLevel } from "@/components/kit/list-tag";
import { RegularListItem } from "@/components/kit/regular-list-item";
import { SearchControl } from "@/components/kit/search-control";

type SearchPagePrototypeProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  autoFocus?: boolean;
  onBack: () => void;
};

const people: Array<{
  name: string;
  userId: string;
  avatar: string;
  level: MembershipLevel;
  gender: "female" | "male";
  age: number;
}> = [
  {
    name: "Cassie",
    userId: "TOP 827419",
    avatar: "/prototypes/toptop-home/avatar-cassie.png",
    level: 10,
    gender: "female",
    age: 28,
  },
  {
    name: "Andrew",
    userId: "TOP 653028",
    avatar: "/prototypes/toptop-home/avatar-andrew.png",
    level: 9,
    gender: "male",
    age: 26,
  },
  {
    name: "Estelle",
    userId: "TOP 401752",
    avatar: "/prototypes/toptop-home/avatar-estelle.png",
    level: 8,
    gender: "female",
    age: 24,
  },
  {
    name: "Felix",
    userId: "TOP 199620",
    avatar: "/prototypes/toptop-home/avatar-felix.png",
    level: 7,
    gender: "male",
    age: 25,
  },
];

const games = [
  {
    name: "Jackaroo",
    image: "/prototypes/toptop-home/game-jackaroo-v2.png",
  },
  { name: "Carrom", image: "/prototypes/toptop-home/game-carrom-v2.png" },
  { name: "Uno", image: "/prototypes/toptop-home/game-uno-v2.png" },
  {
    name: "Candy Boom",
    image: "/prototypes/toptop-home/game-candy-boom-v2.png",
  },
] as const;

const recentSearches = ["Cassie", "Jackaroo", "TOP 653028"] as const;

export function SearchPagePrototype({
  width = 375,
  height = 812,
  theme = "light",
  autoFocus = true,
  onBack,
}: SearchPagePrototypeProps) {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<readonly string[]>(recentSearches);
  const [toast, setToast] = useState<string | null>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const filteredPeople = useMemo(
    () =>
      normalizedQuery
        ? people.filter(({ name, userId }) =>
            `${name} ${userId}`.toLocaleLowerCase().includes(normalizedQuery),
          )
        : people,
    [normalizedQuery],
  );
  const filteredGames = useMemo(
    () =>
      normalizedQuery
        ? games.filter(({ name }) =>
            name.toLocaleLowerCase().includes(normalizedQuery),
          )
        : games,
    [normalizedQuery],
  );

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const hasResults = filteredPeople.length + filteredGames.length > 0;

  return (
    <div
      className="pageCanvasDevice prototypeSearchDevice"
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`TopTop 搜索原型 · ${width}×${height}`}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />
      <header className="prototypeSearchHeader">
        <SearchControl
          value={query}
          active
          autoFocus={autoFocus}
          ariaLabel="TopTop 搜索"
          onActivate={() => undefined}
          onChange={setQuery}
          onCancel={onBack}
        />
      </header>

      <main className="prototypeSearchScroll">
        {!normalizedQuery && history.length ? (
          <section
            className="prototypeSearchSection prototypeSearchRecent"
            aria-labelledby="recent-searches-title"
          >
            <div className="prototypeSearchSectionHeader">
              <h2 id="recent-searches-title">Recent searches</h2>
              <button
                type="button"
                onClick={() => {
                  setHistory([]);
                  setToast("已清除搜索记录");
                }}
              >
                Clear
              </button>
            </div>
            <div className="prototypeSearchChips">
              {history.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuery(item)}
                >
                  <Image
                    src="/icons/search-control/search.svg"
                    alt=""
                    width={16}
                    height={16}
                  />
                  {item}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {filteredPeople.length ? (
          <section
            className="prototypeSearchSection"
            aria-labelledby="people-results-title"
          >
            <div className="prototypeSearchSectionHeader">
              <h2 id="people-results-title">
                {normalizedQuery ? "People" : "Discover people"}
              </h2>
              <span>{filteredPeople.length}</span>
            </div>
            <div className="prototypeSearchPeopleList" role="list">
              {filteredPeople.map((person) => (
                <RegularListItem
                  key={person.userId}
                  listType="message"
                  title={person.name}
                  subtitle={person.userId}
                  ariaLabel={`打开 ${person.name} 的个人资料`}
                  onPress={() => setToast(`打开 ${person.name} 的个人资料`)}
                  leading={
                    <AvatarVisual
                      size={48}
                      src={person.avatar}
                      alt=""
                    />
                  }
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
                />
              ))}
            </div>
          </section>
        ) : null}

        {filteredGames.length ? (
          <section
            className="prototypeSearchSection"
            aria-labelledby="game-results-title"
          >
            <div className="prototypeSearchSectionHeader">
              <h2 id="game-results-title">
                {normalizedQuery ? "Games" : "Popular games"}
              </h2>
              <span>{filteredGames.length}</span>
            </div>
            <div className="prototypeSearchGameGrid">
              {filteredGames.map((game) => (
                <button
                  key={game.name}
                  type="button"
                  aria-label={`打开 ${game.name}`}
                  onClick={() => setToast(`启动 ${game.name}`)}
                >
                  <Image
                    src={game.image}
                    alt=""
                    width={160}
                    height={96}
                  />
                  <strong>{game.name}</strong>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {!hasResults ? (
          <div className="prototypeSearchEmpty">
            <Image
              src="/icons/search-control/search.svg"
              alt=""
              width={32}
              height={32}
            />
            <strong>No results found</strong>
            <p>Try another name, user ID or game.</p>
          </div>
        ) : null}
      </main>

      {toast ? (
        <div className="profilePrototypeToast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
