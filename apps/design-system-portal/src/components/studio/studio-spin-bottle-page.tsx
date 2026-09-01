"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { SystemIcon } from "@/components/kit/system-icon";

type StudioSpinBottlePageProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack: () => void;
};

type SeatState = "empty" | "locked" | "occupied";

type MicSeatData = {
  id: number;
  state: SeatState;
  name?: string;
  avatar?: string;
  muted?: boolean;
  framed?: boolean;
  gender?: "male" | "female";
  joinPrice?: number;
  heat?: number;
};

type GamePhase = "idle" | "spinning" | "confirm" | "paired" | "vote";

type ChatItem =
  | { id: string; kind: "system"; text: string }
  | { id: string; kind: "text"; user: string; text: string };

const AVATARS = {
  andrew: "/prototypes/toptop-home/avatar-andrew.png",
  cassie: "/prototypes/toptop-home/avatar-cassie.png",
  estelle: "/prototypes/toptop-home/avatar-estelle.png",
  felix: "/prototypes/toptop-home/avatar-felix.png",
  latifa: "/prototypes/feed/latifa-avatar.png",
  online1: "/prototypes/message/online-1.png",
  online2: "/prototypes/message/online-2.png",
  online3: "/prototypes/message/online-3.png",
  online4: "/prototypes/message/online-4.png",
} as const;

type SeatCount = 8 | 9 | 10 | 11 | 12;

const SEAT_COUNT_OPTIONS: SeatCount[] = [8, 9, 10, 11, 12];
const DEFAULT_SEAT_COUNT: SeatCount = 10;

const PLAYER_POOL: Array<Omit<MicSeatData, "id" | "state">> = [
  { name: "Mia", avatar: AVATARS.cassie, muted: true, gender: "female", heat: 1200 },
  { name: "Omar", avatar: AVATARS.andrew, muted: true, gender: "male", framed: true, heat: 980 },
  { name: "Lily", avatar: AVATARS.estelle, muted: false, gender: "female", heat: 1560 },
  { name: "Ken", avatar: AVATARS.felix, muted: true, gender: "male", heat: 880 },
  { name: "Zara", avatar: AVATARS.latifa, muted: true, gender: "female", heat: 1120 },
  { name: "Jay", avatar: AVATARS.online1, muted: true, gender: "male", heat: 760 },
  { name: "Nora", avatar: AVATARS.online2, muted: false, gender: "female", heat: 1340 },
  { name: "Leo", avatar: AVATARS.online3, muted: true, gender: "male", framed: true, heat: 920 },
  { name: "Amy", avatar: AVATARS.online4, muted: true, gender: "female", heat: 1050 },
  { name: "Rin", avatar: AVATARS.cassie, muted: true, gender: "female", heat: 890 },
];

function seatLayoutFor(
  count: SeatCount,
  ringSize?: { width: number; height: number },
) {
  // Slightly smaller seats leave more chord spacing on the booth cushion ring.
  const seatScale = count <= 8 ? 0.9 : count <= 10 ? 0.8 : 0.72;
  const fallbackBooth = 320;
  const fallbackRadius = fallbackBooth * 0.385;

  if (!ringSize || ringSize.width < 48 || ringSize.height < 48) {
    return {
      ringRadius: fallbackRadius,
      seatScale,
      boothSize: fallbackBooth,
    };
  }

  // Booth fills the ring stage; seats sit on the velvet cushion mid-ring (~0.385 of diameter).
  const boothSize = Math.min(ringSize.width, ringSize.height) * 0.98;
  const cushionRadius = boothSize * 0.385;
  const radialClearance = 28 * seatScale;
  const maxByBox =
    Math.min(ringSize.width, ringSize.height) / 2 - radialClearance;
  const ringRadius = Math.max(72, Math.min(cushionRadius, maxByBox));
  return { ringRadius, seatScale, boothSize };
}

function buildSeats(count: SeatCount): MicSeatData[] {
  const emptySlots = Math.max(1, Math.round(count * 0.22));
  const occupiedCount = count - emptySlots;

  return Array.from({ length: count }, (_, id) => {
    if (id < occupiedCount) {
      const profile = PLAYER_POOL[id % PLAYER_POOL.length];
      return {
        id,
        state: "occupied" as const,
        ...profile,
      };
    }

    const emptyIndex = id - occupiedCount;
    const isMale = emptyIndex % 2 === 0;
    return {
      id,
      state: "empty" as const,
      gender: isMale ? "male" : "female",
      joinPrice: isMale ? 5 : undefined,
    };
  });
}

function seatAngleDeg(index: number, seatCount: number) {
  return (index / seatCount) * 360 - 90;
}

function seatPosition(index: number, seatCount: number, ringRadius: number) {
  const rad = (seatAngleDeg(index, seatCount) * Math.PI) / 180;
  return {
    x: Math.cos(rad) * ringRadius,
    y: Math.sin(rad) * ringRadius,
  };
}

function describePairArc(
  fromIndex: number,
  toIndex: number,
  seatCount: number,
  ringRadius: number,
) {
  const from = seatPosition(fromIndex, seatCount, ringRadius);
  const to = seatPosition(toIndex, seatCount, ringRadius);
  let delta = toIndex - fromIndex;
  if (delta < 0) delta += seatCount;
  const largeArc = delta > seatCount / 2 ? 1 : 0;
  return `M ${from.x} ${from.y} A ${ringRadius} ${ringRadius} 0 ${largeArc} 1 ${to.x} ${to.y}`;
}

function firstOccupiedIndex(seats: MicSeatData[]) {
  return seats.findIndex((seat) => seat.state === "occupied");
}

const INITIAL_CHAT: ChatItem[] = [
  { id: "s1", kind: "system", text: "Kiss Kiss room · spin the bottle, feel the spark ✨" },
  { id: "s2", kind: "text", user: "Nora", text: "Who gets the first spin? 😏" },
];

const PHASE_LABEL: Record<GamePhase, string> = {
  idle: "围桌就绪 · 点击 Spin 开始暧昧轮转",
  spinning: "瓶口转向中…",
  confirm: "心动瞬间 · Kiss 还是 Pass？",
  paired: "配对成功 · 真心话即将开始",
  vote: "公屏投票 · 12s",
};

/** Studio-only spin-bottle voice room — circular mic ring, not Core catalog. */
export function StudioSpinBottlePage({
  width = 375,
  height = 812,
  onBack,
}: StudioSpinBottlePageProps) {
  const chatRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const sequence = useRef(INITIAL_CHAT.length + 1);
  const spinTimer = useRef<number | null>(null);

  const [seatCount, setSeatCount] = useState<SeatCount>(DEFAULT_SEAT_COUNT);
  const [seats, setSeats] = useState(() => buildSeats(DEFAULT_SEAT_COUNT));
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [spinnerIndex, setSpinnerIndex] = useState(() =>
    firstOccupiedIndex(buildSeats(DEFAULT_SEAT_COUNT)),
  );
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [bottleRotation, setBottleRotation] = useState(0);
  const [chat, setChat] = useState(INITIAL_CHAT);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmSheetOpen, setConfirmSheetOpen] = useState(false);
  const [voteProgress, setVoteProgress] = useState(72);
  const [ringSize, setRingSize] = useState({ width: 0, height: 0 });

  const { ringRadius, seatScale, boothSize } = seatLayoutFor(seatCount, ringSize);

  const occupiedIndices = seats
    .map((seat, index) => (seat.state === "occupied" ? index : -1))
    .filter((index) => index >= 0);

  const pushChat = useCallback((item: Omit<ChatItem, "id">) => {
    setChat((current) => [
      ...current,
      { ...item, id: `chat-${sequence.current++}` },
    ]);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2400);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    const list = chatRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [chat, confirmSheetOpen]);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring || typeof ResizeObserver === "undefined") return;

    const updateSize = () => {
      const { width, height } = ring.getBoundingClientRect();
      setRingSize((prev) =>
        Math.abs(prev.width - width) < 0.5 && Math.abs(prev.height - height) < 0.5
          ? prev
          : { width, height },
      );
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(ring);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (spinTimer.current !== null) {
        window.clearTimeout(spinTimer.current);
      }
    };
  }, []);

  const pickTarget = useCallback(
    (from: number) => {
      const candidates = occupiedIndices.filter((index) => index !== from);
      if (candidates.length === 0) return from;
      const oppositeGender = seats[from]?.gender;
      const preferred = candidates.filter(
        (index) =>
          oppositeGender &&
          seats[index]?.gender &&
          seats[index]?.gender !== oppositeGender,
      );
      const pool = preferred.length > 0 ? preferred : candidates;
      return pool[Math.floor(Math.random() * pool.length)] ?? from;
    },
    [occupiedIndices, seats],
  );

  const startSpin = () => {
    if (phase !== "idle" && phase !== "paired") return;
    if (occupiedIndices.length < 2) {
      setFeedback("Need at least 2 players on mic");
      return;
    }

    setPhase("spinning");
    setConfirmSheetOpen(false);
    setTargetIndex(null);

    const nextTarget = pickTarget(spinnerIndex);
    const seatAngle = 360 / seatCount;
    const targetRotation = 720 + nextTarget * seatAngle;

    setBottleRotation(targetRotation);

    spinTimer.current = window.setTimeout(() => {
      setTargetIndex(nextTarget);
      setPhase("confirm");
      setConfirmSheetOpen(true);
      pushChat({
        kind: "system",
        text: `@${seats[spinnerIndex]?.name ?? "Player"} spun the bottle → @${seats[nextTarget]?.name ?? "Player"}`,
      });
    }, 2200);
  };

  const handleKiss = () => {
    setConfirmSheetOpen(false);
    setPhase("paired");
    pushChat({
      kind: "system",
      text: `💋 Both chose Kiss — truth or dare starts`,
    });
    setFeedback("Kiss match · Open truth prompts next");
    window.setTimeout(() => {
      setPhase("vote");
      setVoteProgress(68);
    }, 1800);
  };

  const handlePass = () => {
    setConfirmSheetOpen(false);
    setTargetIndex(null);
    setPhase("idle");
    setBottleRotation(0);
    pushChat({ kind: "system", text: "Pass — back to seats, no penalty" });
    setFeedback("Passed · Next spin");
  };

  const handleVote = (approved: boolean) => {
    setPhase("idle");
    setTargetIndex(null);
    setBottleRotation(0);
    setSpinnerIndex((current) => {
      const order = occupiedIndices;
      const pos = order.indexOf(current);
      return order[(pos + 1) % order.length] ?? current;
    });
    pushChat({
      kind: "system",
      text: approved
        ? "Vote passed · player keeps the seat"
        : "Vote failed · seat opens for queue",
    });
    setFeedback(approved ? "Vote passed" : "Player removed · fee refunded");
  };

  const changeSeatCount = (next: SeatCount) => {
    if (next === seatCount) return;
    if (phase !== "idle" && phase !== "paired") {
      setFeedback("玩法进行中 · 结束后再调整席位数");
      return;
    }

    const nextSeats = buildSeats(next);
    setSeatCount(next);
    setSeats(nextSeats);
    setSpinnerIndex(firstOccupiedIndex(nextSeats));
    setTargetIndex(null);
    setBottleRotation(0);
    setConfirmSheetOpen(false);
    setPhase("idle");
    pushChat({
      kind: "system",
      text: `Room layout switched to ${next} seats`,
    });
    setFeedback(`已切换为 ${next} 麦围桌`);
  };

  const spinnerSeat = seats[spinnerIndex];
  const targetSeat = targetIndex !== null ? seats[targetIndex] : null;
  const showPairLink =
    (phase === "paired" || phase === "vote" || phase === "confirm") &&
    targetIndex !== null;

  const pairArc =
    showPairLink && targetIndex !== null
      ? describePairArc(spinnerIndex, targetIndex, seatCount, ringRadius)
      : null;

  return (
    <div
      className={[
        "pageCanvasDevice studioSpinBottleDevice",
        confirmSheetOpen ? "studioSpinBottleDevice--sheetOpen" : "",
        phase === "paired" || phase === "vote"
          ? "studioSpinBottleDevice--heated"
          : "",
        phase === "spinning" ? "studioSpinBottleDevice--spinning" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`Studio 转瓶语音房 · ${width}×${height}`}
    >
      <IosStatusBar appearance="light-content" />

      <div className="studioSpinBottleBody">
        <header className="studioSpinBottleTopBar" aria-label="房间顶栏">
          <button type="button" aria-label="退出房间" onClick={onBack}>
            <SystemIcon name="back" size={24} />
          </button>
          <div className="studioSpinBottleRoomMeta">
            <strong>Kiss · Truth Circle</strong>
            <span>
              {seatCount} 麦 · ID 366998
            </span>
          </div>
          <button type="button" className="studioSpinBottleIconBtn" aria-label="收藏房间">
            <SystemIcon name="like" size={20} />
          </button>
          <span className="studioSpinBottleBossPill">BOSS</span>
          <button type="button" className="studioSpinBottleIconBtn" aria-label="分享房间">
            <SystemIcon name="link" size={20} />
          </button>
        </header>

        <div className="studioSpinBottleTagRow" aria-label="房间标签">
          <span className="studioSpinBottleTag studioSpinBottleTag--pink">Flirt</span>
          <span className="studioSpinBottleTag studioSpinBottleTag--gold">Spicy Lv.2</span>
          <span className="studioSpinBottleTag">♀ ask · ♂ answer</span>
          <button type="button" className="studioSpinBottleRoomGifts">
            <SystemIcon name="gift" size={14} />
            Room gifts
          </button>
        </div>

        <section className="studioSpinBottleStage" aria-label="围桌麦位">
          <div className="studioSpinBottleStageHead">
            <div className="studioSpinBottleStageHeadRow">
              <p className="studioSpinBottleCountdown">
                心动倒计时 <strong aria-live="polite">00:30</strong>
              </p>
              <button
                type="button"
                className="studioSpinBottleExtendBtn"
                onClick={() => setFeedback("已加时 3 分钟 · 氛围继续")}
              >
                +3 分钟
              </button>
            </div>
            <div
              className="studioSpinBottleSeatPicker"
              role="group"
              aria-label="选择座位数"
            >
              <span className="studioSpinBottleSeatPickerLabel">席位数</span>
              {SEAT_COUNT_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={[
                    "studioSpinBottleSeatOption",
                    seatCount === option ? "studioSpinBottleSeatOption--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={seatCount === option}
                  aria-label={`${option} 个座位`}
                  onClick={() => changeSeatCount(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={ringRef}
            className="studioSpinBottleRing"
            style={
              {
                "--spin-ring-radius": `${ringRadius}px`,
                "--spin-seat-scale": `${seatScale}`,
                "--spin-booth-size": `${boothSize}px`,
              } as CSSProperties
            }
          >
            <div
              className="studioSpinBottleBooth"
              aria-hidden="true"
              style={{
                backgroundImage:
                  'url("/prototypes/studio/spin-bottle-booth.jpg")',
              }}
            />

            <div className="studioSpinBottleRadar" aria-hidden="true">
              <span className="studioSpinBottleRadarRing studioSpinBottleRadarRing--1" />
              <span className="studioSpinBottleRadarRing studioSpinBottleRadarRing--2" />
            </div>

            <svg
              className="studioSpinBottleConstellation"
              viewBox={`${-ringRadius - 40} ${-ringRadius - 40} ${(ringRadius + 40) * 2} ${(ringRadius + 40) * 2}`}
              aria-hidden="true"
            >
              {seats.map((_, index) => {
                const pos = seatPosition(index, seatCount, ringRadius);
                return (
                  <line
                    key={`line-${index}`}
                    x1="0"
                    y1="0"
                    x2={pos.x}
                    y2={pos.y}
                    stroke="rgb(120 180 255 / 22%)"
                    strokeDasharray="3 6"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>

            {pairArc ? (
              <svg
                className="studioSpinBottlePairArc"
                viewBox={`${-ringRadius - 40} ${-ringRadius - 40} ${(ringRadius + 40) * 2} ${(ringRadius + 40) * 2}`}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="pairArcGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#5ce1ff" />
                    <stop offset="50%" stopColor="#ff6eb4" />
                    <stop offset="100%" stopColor="#ffb347" />
                  </linearGradient>
                </defs>
                <path
                  d={pairArc}
                  fill="none"
                  stroke="url(#pairArcGrad)"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
              </svg>
            ) : null}

            <div className="studioSpinBottleCore" aria-hidden="true">
              <div
                className={[
                  "studioSpinBottleWaveform",
                  phase === "spinning" || phase === "paired"
                    ? "studioSpinBottleWaveform--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {WAVEFORM_BARS.map((height, index) => (
                  <span
                    key={index}
                    className="studioSpinBottleWaveBar"
                    style={
                      {
                        "--bar-height": `${height}px`,
                        "--bar-delay": `${index * 0.04}s`,
                      } as CSSProperties
                    }
                  />
                ))}
              </div>

              <div
                className={[
                  "studioSpinBottleBottle",
                  phase === "spinning" ? "studioSpinBottleBottle--spinning" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div
                  className="studioSpinBottleBottleInner"
                  style={{ transform: `rotate(${bottleRotation}deg)` }}
                >
                  🍾
                </div>
                {showPairLink ? (
                  <span className="studioSpinBottleCenterHeart">♥</span>
                ) : null}
              </div>
            </div>

            {seats.map((seat, index) => {
              const pos = seatPosition(index, seatCount, ringRadius);
              return (
                <MicSeatCell
                  key={`seat-${seatCount}-${index}`}
                  seat={seat}
                  seatIndex={index}
                  highlight={
                    spinnerIndex === index
                      ? "spinner"
                      : targetIndex === index
                        ? "target"
                        : undefined
                  }
                  style={{
                    transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${seatScale})`,
                  }}
                />
              );
            })}
          </div>
        </section>

        <div className="studioSpinBottleStateBar" aria-live="polite">
          <span>{PHASE_LABEL[phase]}</span>
          {phase === "idle" || phase === "paired" ? (
            <button type="button" className="studioSpinBottleSpinBtn" onClick={startSpin}>
              Spin ♡
            </button>
          ) : null}
          {phase === "vote" ? (
            <div className="studioSpinBottleVoteInline">
              <div className="studioSpinBottleVoteTrack">
                <span style={{ width: `${voteProgress}%` }} />
              </div>
              <button type="button" onClick={() => handleVote(true)}>
                👍
              </button>
              <button type="button" onClick={() => handleVote(false)}>
                👎
              </button>
            </div>
          ) : null}
        </div>

        <div className="studioSpinBottleOnlineStrip" aria-label="在线用户">
          <button type="button" className="studioSpinBottleExpandBtn" aria-label="展开">
            <SystemIcon name="chevronRight" size={16} />
          </button>
          <div className="studioSpinBottleOnlineAvatars">
            {occupiedIndices.slice(0, 5).map((index) => (
              <AvatarVisual
                key={seats[index]?.id}
                size={24}
                src={seats[index]?.avatar}
                alt=""
              />
            ))}
          </div>
          <span className="studioSpinBottleOnlineCount">
            <SystemIcon name="contacts" size={14} />
            {occupiedIndices.length}
          </span>
        </div>

        <section className="studioSpinBottleChat" aria-label="公屏">
          <div className="studioSpinBottleChatScroll" ref={chatRef}>
            {chat.map((item) =>
              item.kind === "system" ? (
                <p key={item.id} className="studioSpinBottleChatSystem">
                  {item.text}
                </p>
              ) : (
                <p key={item.id} className="studioSpinBottleChatText">
                  <strong>{item.user}</strong>
                  <span>{item.text}</span>
                </p>
              ),
            )}
          </div>
        </section>

        <footer className="studioSpinBottleBottomBar" aria-label="底部操作">
          <button type="button" aria-label="扬声器">
            <SystemIcon name="voice" size={22} />
          </button>
          <button type="button" aria-label="麦克风">
            <SystemIcon name="microphone" size={22} />
          </button>
          <button type="button" aria-label="表情">
            <SystemIcon name="emoji" size={22} />
          </button>
          <label className="studioSpinBottleTypeField">
            <span className="visuallyHidden">输入消息</span>
            <input type="text" readOnly placeholder="Type…" />
          </label>
          <button type="button" aria-label="更多">
            <SystemIcon name="more" size={22} />
          </button>
          <button type="button" aria-label="礼物">
            <SystemIcon name="gift" size={22} />
          </button>
          <button type="button" aria-label="消息">
            <SystemIcon name="comment" size={22} />
          </button>
        </footer>
      </div>

      {confirmSheetOpen && spinnerSeat && targetSeat ? (
        <div className="feedComposeOverlay studioSpinBottleOverlay" role="presentation">
          <button
            type="button"
            className="feedComposeOverlayBackdrop"
            aria-label="关闭"
            onClick={handlePass}
          />
          <section className="feedComposeMediaSheet studioSpinBottleSheet" aria-label="Kiss 或 Pass">
            <div className="feedComposeMediaSheetHandle" aria-hidden="true" />
            <header className="studioSpinBottleSheetHeader">
              <p>心动确认</p>
              <div className="studioSpinBottleSheetPair">
                <AvatarVisual size={48} src={spinnerSeat.avatar} alt="" />
                <span aria-hidden="true">♥</span>
                <AvatarVisual size={48} src={targetSeat.avatar} alt="" framed />
              </div>
              <p className="studioSpinBottleSheetNames">
                {spinnerSeat.name} & {targetSeat.name}
              </p>
            </header>
            <div className="studioSpinBottleSheetActions">
              <button
                type="button"
                className="kitButton kitButton--height48 kitButton--primary"
                onClick={handleKiss}
              >
                Kiss
              </button>
              <button
                type="button"
                className="kitButton kitButton--height48 kitButton--secondary"
                onClick={handlePass}
              >
                Pass
              </button>
            </div>
            <button
              type="button"
              className="studioSpinBottleSkipLink"
              onClick={() => {
                handleKiss();
                setFeedback("Skipped Q&A · back to spin");
              }}
            >
              Skip truth round
            </button>
          </section>
        </div>
      ) : null}

      {feedback ? (
        <div className="profilePrototypeToast" role="status" aria-live="polite">
          {feedback}
        </div>
      ) : null}
    </div>
  );
}

const WAVEFORM_BARS = [
  6, 10, 14, 18, 12, 8, 16, 22, 14, 10, 18, 24, 16, 12, 8, 14, 20, 12, 8, 16, 10, 6, 12, 8,
];

function MicSeatCell({
  seat,
  seatIndex,
  highlight,
  style,
}: {
  seat: MicSeatData;
  seatIndex: number;
  highlight?: "spinner" | "target";
  style?: CSSProperties;
}) {
  const auraTone = seatIndex % 2 === 0 ? "cyan" : "magenta";

  const cellClass = [
    "studioSpinBottleMicCell",
    seat.state === "locked" ? "studioSpinBottleMicCell--locked" : "",
    seat.state === "empty" ? "studioSpinBottleMicCell--empty" : "",
    highlight === "spinner" ? "studioSpinBottleMicCell--spinner" : "",
    highlight === "target" ? "studioSpinBottleMicCell--target" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const auraClass = [
    "studioSpinBottleAura",
    auraTone === "cyan" ? "studioSpinBottleAura--cyan" : "studioSpinBottleAura--magenta",
    highlight ? "studioSpinBottleAura--active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cellClass} aria-label={`麦位 ${seatIndex + 1}`} style={style}>
      {seat.muted ? (
        <span className="studioSpinBottleMicBadge" aria-label="闭麦">
          <SystemIcon name="microphone" size={11} />
        </span>
      ) : null}

      <div className={auraClass}>
        <div className="studioSpinBottleMicAvatarWrap">
          {seat.state === "occupied" ? (
            <>
              <AvatarVisual
                size={48}
                src={seat.avatar}
                alt=""
                framed={seat.framed}
              />
              <span className="studioSpinBottleSeatIndex">{seatIndex + 1}</span>
            </>
          ) : seat.state === "locked" ? (
            <span className="studioSpinBottleMicLocked">
              <SystemIcon name="settings" size={20} />
            </span>
          ) : (
            <button type="button" className="studioSpinBottleMicEmpty" aria-label="入座">
              <SystemIcon name="addCircle" size={24} />
              {seat.joinPrice ? (
                <span className="studioSpinBottleMicPrice">{seat.joinPrice}◆</span>
              ) : (
                <span className="studioSpinBottleMicPrice">Free</span>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="studioSpinBottleMicMeta">
        {seat.state === "occupied" ? (
          <>
            <span className="studioSpinBottleMicName">{seat.name}</span>
            <span className="studioSpinBottleMicHeat">
              <SystemIcon name="like" size={10} />
              {seat.heat ?? 0}
            </span>
          </>
        ) : seat.state === "locked" ? (
          <span className="studioSpinBottleMicName studioSpinBottleMicName--muted">
            Locked
          </span>
        ) : (
          <span className="studioSpinBottleMicName studioSpinBottleMicName--muted">
            {seat.gender === "male" ? "男席 · 5◆" : "女席 · Free"}
          </span>
        )}
      </div>
    </article>
  );
}
