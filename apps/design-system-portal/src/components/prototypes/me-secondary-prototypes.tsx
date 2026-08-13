"use client";

import {
  useMemo,
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { SearchControl } from "@/components/kit/search-control";
import { Switch } from "@/components/kit/switch";
import { SystemIcon } from "@/components/kit/system-icon";
import type { MeSecondaryScreen } from "@/lib/prototype-app-routes";

type MeSecondaryPrototypeProps = {
  screen: MeSecondaryScreen;
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack: () => void;
};

const guidelineSections = [
  {
    title: "Respect other people",
    body: "Use considerate language. Harassment, hate speech, threats, and repeated unwanted contact are not allowed.",
  },
  {
    title: "Keep rooms safe",
    body: "Do not share illegal, sexually explicit, or dangerous content. Room hosts should act when a conversation becomes unsafe.",
  },
  {
    title: "Protect personal information",
    body: "Only share information you own. Never expose another person's identity, location, account, or private conversation.",
  },
] as const;

const helpItems = [
  {
    question: "How do I change my profile?",
    answer: "Open Me, tap Edit beside your profile, update the fields you need, then save.",
  },
  {
    question: "How do I control who can message me?",
    answer: "Open Settings, choose Privacy, and change Direct messages to the audience you prefer.",
  },
  {
    question: "How do I report a room or account?",
    answer: "Open the room or profile menu, choose Report, select a reason, and submit the relevant details.",
  },
] as const;

export function MeSecondaryPrototype({
  screen,
  width = 375,
  height = 812,
  theme = "light",
  onBack,
}: MeSecondaryPrototypeProps) {
  const title =
    screen === "community-guidelines"
      ? "Community Guidelines"
      : screen === "help"
        ? "Help"
        : "Settings";

  return (
    <div
      className="pageCanvasDevice meSecondaryDevice"
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`${title} 二级页面原型 · ${width}×${height}`}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />
      <div className="pageCanvasContentShell">
        <RegularNavigation title={title} onBack={onBack} />
        <main className="meSecondaryScroll">
          {screen === "community-guidelines" ? <GuidelinesPage /> : null}
          {screen === "help" ? <HelpPage /> : null}
          {screen === "settings" ? <SettingsPage /> : null}
        </main>
      </div>
    </div>
  );
}

function GuidelinesPage() {
  const [detailsVisible, setDetailsVisible] = useState(false);

  return (
    <>
      <section className="meSecondaryIntro" aria-labelledby="guidelines-intro">
        <span className="meSecondaryIntroIcon" aria-hidden="true">
          <SystemIcon name="guidelines" />
        </span>
        <div>
          <h2 id="guidelines-intro">A safer community starts with each of us</h2>
          <p>
            These rules apply to profiles, messages, rooms, and every shared
            piece of content.
          </p>
        </div>
      </section>
      <div className="meSecondaryArticleList">
        {guidelineSections.map((section, index) => (
          <article key={section.title}>
            <span aria-hidden="true">{index + 1}</span>
            <div>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </div>
          </article>
        ))}
      </div>
      <section className="meSecondaryDisclosure">
        <button
          type="button"
          aria-expanded={detailsVisible}
          onClick={() => setDetailsVisible((current) => !current)}
        >
          <span>Enforcement and appeals</span>
          <SystemIcon
            name={detailsVisible ? "more" : "chevronRight"}
            size={20}
          />
        </button>
        {detailsVisible ? (
          <p>
            We may remove content or limit accounts that break these rules. You
            can appeal an enforcement decision from the notice you receive.
          </p>
        ) : null}
      </section>
    </>
  );
}

function HelpPage() {
  const [query, setQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return helpItems;
    return helpItems.filter((item) =>
      `${item.question} ${item.answer}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  return (
    <>
      <SearchControl
        value={query}
        active={searchActive}
        placeholder="Search help"
        ariaLabel="搜索帮助内容"
        onActivate={() => setSearchActive(true)}
        onChange={setQuery}
        onCancel={() => {
          setQuery("");
          setSearchActive(false);
        }}
      />
      <section className="meSecondarySection" aria-labelledby="help-topics">
        <h2 id="help-topics">Popular topics</h2>
        {filteredItems.length ? (
          <div className="meSecondaryFaqList">
            {filteredItems.map((item) => {
              const expanded = expandedQuestion === item.question;
              return (
                <article key={item.question}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() =>
                      setExpandedQuestion(expanded ? null : item.question)
                    }
                  >
                    <span>{item.question}</span>
                    <SystemIcon name="chevronRight" size={20} />
                  </button>
                  {expanded ? <p>{item.answer}</p> : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="meSecondaryEmpty">
            <h3>No matching help topic</h3>
            <p>Try a shorter phrase or clear your search to browse all topics.</p>
            <button
              type="button"
              className="kitButton kitButton--height32 kitButton--primary"
              onClick={() => setQuery("")}
            >
              Clear search
            </button>
          </div>
        )}
      </section>
    </>
  );
}

function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [roomInvites, setRoomInvites] = useState(true);
  const [discoverable, setDiscoverable] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  return (
    <>
      <SettingsGroup title="Notifications">
        <SettingsSwitch
          label="Push notifications"
          description="Messages, follows, and account activity"
          checked={notifications}
          onChange={setNotifications}
        />
        <SettingsSwitch
          label="Room invitations"
          description="Invites from people you follow"
          checked={roomInvites}
          onChange={setRoomInvites}
        />
      </SettingsGroup>
      <SettingsGroup title="Privacy">
        <SettingsSwitch
          label="Show me in discovery"
          description="Allow people to find your profile"
          checked={discoverable}
          onChange={setDiscoverable}
        />
        <button
          type="button"
          className="meSecondaryActionRow"
          onClick={() => setActionStatus("Direct messages settings opened")}
        >
          <span>
            <strong>Direct messages</strong>
            <small>People you follow</small>
          </span>
          <SystemIcon name="chevronRight" size={20} />
        </button>
      </SettingsGroup>
      <SettingsGroup title="Account">
        <button
          type="button"
          className="meSecondaryActionRow"
          onClick={() => setActionStatus("Blocked accounts opened")}
        >
          <span>
            <strong>Blocked accounts</strong>
            <small>Review accounts you have blocked</small>
          </span>
          <SystemIcon name="chevronRight" size={20} />
        </button>
      </SettingsGroup>
      {actionStatus ? (
        <p className="meSecondaryActionStatus" role="status">
          {actionStatus}
        </p>
      ) : null}
    </>
  );
}

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="meSecondarySettingsGroup" aria-labelledby={`settings-${title}`}>
      <h2 id={`settings-${title}`}>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function SettingsSwitch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const fieldId = useId();

  return (
    <label className="meSecondarySwitchRow" htmlFor={fieldId}>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <Switch id={fieldId} checked={checked} onChange={onChange} />
    </label>
  );
}
