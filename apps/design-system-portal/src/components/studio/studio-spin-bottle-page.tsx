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
type Gender = "male" | "female";
type QuestionLevel = 1 | 2 | 3;
type GamePhase = "idle" | "spinning" | "confirm" | "qa" | "vote";

type MicSeatData = {
  id: number;
  state: SeatState;
  name?: string;
  avatar?: string;
  muted?: boolean;
  framed?: boolean;
  gender: Gender;
  joinPrice?: number;
  heat?: number;
  isBot?: boolean;
};

type ChatItem =
  | { id: string; kind: "system"; text: string }
  | { id: string; kind: "text"; user: string; text: string };

type WithoutId<T> = T extends { id: string } ? Omit<T, "id"> : never;
type ChatItemInput = WithoutId<ChatItem>;

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
const VOTE_PASS_THRESHOLD = 60;
const MALE_JOIN_PRICE = 5;
const OFFICIAL_ROOM_INDEX = 1;
const OFFICIAL_ROOM_TOTAL = 3;
const ROOM_QUESTION_LEVEL: QuestionLevel = 2;

const QUESTION_LEVEL_LABEL: Record<QuestionLevel, string> = {
  1: "Lv.1 破冰",
  2: "Lv.2 暧昧",
  3: "Lv.3 火辣",
};

const TRUTH_BANK: Record<QuestionLevel, string[]> = {
  1: [
    "你理想中的第一次约会会选哪里？",
    "最近让你开心的一件小事是什么？",
    "你更喜欢语音聊天还是文字聊天？",
  ],
  2: [
    "你觉得异性身上最吸引你的特质是什么？",
    "如果只能问对方一个问题，你会问什么？",
    "你会因为声音好听而心动吗？",
  ],
  3: [
    "你接受异地恋吗？最长能接受多久？",
    "你会为喜欢的人改变生活习惯吗？",
    "你觉得暧昧期和确认关系之间，差的是什么？",
  ],
};

const PLAYER_POOL: Array<Omit<MicSeatData, "id" | "state" | "gender">> = [
  { name: "Mia", avatar: AVATARS.cassie, muted: true, heat: 1200 },
  { name: "Omar", avatar: AVATARS.andrew, muted: true, framed: true, heat: 980 },
  { name: "Lily", avatar: AVATARS.estelle, muted: false, heat: 1560 },
  { name: "Ken", avatar: AVATARS.felix, muted: true, heat: 880, isBot: true },
  { name: "Zara", avatar: AVATARS.latifa, muted: true, heat: 1120 },
  { name: "Jay", avatar: AVATARS.online1, muted: true, heat: 760, isBot: true },
  { name: "Nora", avatar: AVATARS.online2, muted: false, heat: 1340 },
  { name: "Leo", avatar: AVATARS.online3, muted: true, framed: true, heat: 920 },
  { name: "Amy", avatar: AVATARS.online4, muted: true, heat: 1050 },
  { name: "Rin", avatar: AVATARS.cassie, muted: true, heat: 890, isBot: true },
];

function genderForSeatIndex(index: number): Gender {
  return index % 2 === 0 ? "female" : "male";
}

function seatLayoutFor(
  count: SeatCount,
  ringSize?: { width: number; height: number },
) {
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
  let playerIndex = 0;

  return Array.from({ length: count }, (_, id) => {
    const gender = genderForSeatIndex(id);

    if (id < occupiedCount) {
      while (playerIndex < PLAYER_POOL.length) {
        const profile = PLAYER_POOL[playerIndex++];
        const profileGender: Gender =
          profile.name && ["Omar", "Ken", "Jay", "Leo"].includes(profile.name)
            ? "male"
            : "female";
        if (profileGender === gender) {
          return {
            id,
            state: "occupied" as const,
            gender,
            joinPrice: gender === "male" ? MALE_JOIN_PRICE : undefined,
            ...profile,
          };
        }
      }
    }

    return {
      id,
      state: "empty" as const,
      gender,
      joinPrice: gender === "male" ? MALE_JOIN_PRICE : undefined,
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

function nextClockwiseOccupied(
  from: number,
  seats: MicSeatData[],
  seatCount: number,
  predicate?: (index: number) => boolean,
) {
  for (let step = 1; step <= seatCount; step++) {
    const index = (from + step) % seatCount;
    const seat = seats[index];
    if (seat?.state !== "occupied") continue;
    if (predicate && !predicate(index)) continue;
    return index;
  }
  return from;
}

function pickQuestion(level: QuestionLevel) {
  const pool = TRUTH_BANK[level];
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0] ?? "";
}

function resolveQaRoles(
  spinnerSeat: MicSeatData | undefined,
  targetSeat: MicSeatData | undefined,
) {
  if (spinnerSeat?.gender === "female") {
    return { asker: spinnerSeat, answerer: targetSeat };
  }
  if (targetSeat?.gender === "female") {
    return { asker: targetSeat, answerer: spinnerSeat };
  }
  return { asker: spinnerSeat, answerer: targetSeat };
}

function voteTargetSeat(
  spinnerSeat: MicSeatData | undefined,
  targetSeat: MicSeatData | undefined,
) {
  if (spinnerSeat?.gender === "male") return spinnerSeat;
  if (targetSeat?.gender === "male") return targetSeat;
  return spinnerSeat;
}

const INITIAL_CHAT: ChatItem[] = [
  {
    id: "s1",
    kind: "system",
    text: "官方固定房 #01 · 冷启动集中流量，AI 机器人补位中",
  },
  {
    id: "s2",
    kind: "system",
    text: "规则：男女专属位 · 男席 5◆ 入座 · 女席免费 · >2 人即可开局",
  },
  { id: "s3", kind: "text", user: "Nora", text: "顺时针转瓶，谁先被点到？😏" },
];

const PHASE_LABEL: Record<GamePhase, string> = {
  idle: "围桌就绪 · 顺时针轮转，双向 Kiss 进入真心话",
  spinning: "瓶口顺时针转向中…",
  confirm: "心动瞬间 · 双向 Kiss 才进入问答",
  qa: "真心话 · 默认女问男答 · 题库已合规审核",
  vote: "公屏投票 · 赞率 >60% 男性留座",
};

const GUIDE_TASKS = [
  { id: "seat", label: "首次落座", done: true },
  { id: "kiss", label: "完成 Kiss", done: false },
  { id: "vote", label: "参与投票", done: false },
];

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
  const [activeQuestion, setActiveQuestion] = useState("");
  const [ringSize, setRingSize] = useState({ width: 0, height: 0 });

  const { ringRadius, seatScale, boothSize } = seatLayoutFor(seatCount, ringSize);

  const occupiedIndices = seats
    .map((seat, index) => (seat.state === "occupied" ? index : -1))
    .filter((index) => index >= 0);

  const occupiedCount = occupiedIndices.length;
  const canStartGame = occupiedCount > 2;
  const botCount = seats.filter((seat) => seat.isBot).length;

  const pushChat = useCallback((item: ChatItemInput) => {
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
  }, [chat, confirmSheetOpen, phase]);

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
      const oppositeGender = seats[from]?.gender;
      return nextClockwiseOccupied(from, seats, seatCount, (index) => {
        const seatGender = seats[index]?.gender;
        return Boolean(oppositeGender && seatGender && seatGender !== oppositeGender);
      });
    },
    [seatCount, seats],
  );

  const advanceSpinner = useCallback(() => {
    setSpinnerIndex((current) =>
      nextClockwiseOccupied(current, seats, seatCount),
    );
  }, [seatCount, seats]);

  const startSpin = () => {
    if (phase !== "idle") return;
    if (!canStartGame) {
      setFeedback("需 >2 人在麦才能开局");
      return;
    }

    setPhase("spinning");
    setConfirmSheetOpen(false);
    setTargetIndex(null);

    const nextTarget = pickTarget(spinnerIndex);
    const seatAngle = 360 / seatCount;
    const clockwiseSteps =
      (nextTarget - spinnerIndex + seatCount) % seatCount || seatCount;
    const targetRotation = 720 + clockwiseSteps * seatAngle;

    setBottleRotation(targetRotation);

    spinTimer.current = window.setTimeout(() => {
      setTargetIndex(nextTarget);
      setPhase("confirm");
      setConfirmSheetOpen(true);
      pushChat({
        kind: "system",
        text: `@${seats[spinnerIndex]?.name ?? "玩家"} 顺时针转瓶 → @${seats[nextTarget]?.name ?? "玩家"}`,
      });
    }, 2200);
  };

  const handleKiss = () => {
    setConfirmSheetOpen(false);
    const question = pickQuestion(ROOM_QUESTION_LEVEL);
    setActiveQuestion(question);
    setPhase("qa");

    const asker = resolveQaRoles(seats[spinnerIndex], seats[targetIndex ?? -1]);
    pushChat({
      kind: "system",
      text: `💋 双向 Kiss · ${QUESTION_LEVEL_LABEL[ROOM_QUESTION_LEVEL]} 真心话开始`,
    });
    pushChat({
      kind: "text",
      user: asker.asker?.name ?? "女方",
      text: question,
    });
    setFeedback(`${asker.asker?.name ?? "女方"} 提问 · ${asker.answerer?.name ?? "男方"} 作答`);
  };

  const handlePass = () => {
    setConfirmSheetOpen(false);
    setTargetIndex(null);
    setPhase("idle");
    setBottleRotation(0);
    pushChat({ kind: "system", text: "Pass · 回到座位，无惩罚" });
    setFeedback("已 Pass · 下一位顺时针轮转");
    advanceSpinner();
  };

  const finishQa = () => {
    setPhase("vote");
    setVoteProgress(68);
    pushChat({
      kind: "system",
      text: "问答结束 · 公屏投票中（仅考核男性留座，女性免疫）",
    });
  };

  const handleVote = (approved: boolean) => {
    const maleSeat = voteTargetSeat(seats[spinnerIndex], seats[targetIndex ?? -1]);
    const passed = approved && voteProgress >= VOTE_PASS_THRESHOLD;

    setPhase("idle");
    setTargetIndex(null);
    setBottleRotation(0);
    setActiveQuestion("");
    advanceSpinner();

    if (passed) {
      pushChat({
        kind: "system",
        text: `投票通过 ${voteProgress}% · @${maleSeat?.name ?? "男方"} 留座`,
      });
      setFeedback("赞率达标 · 男性留座");
    } else {
      pushChat({
        kind: "system",
        text: `投票未达 60% · @${maleSeat?.name ?? "男方"} 离座，5◆ 退还`,
      });
      setFeedback("男性离座 · 入座费退还");
    }
  };

  const changeSeatCount = (next: SeatCount) => {
    if (next === seatCount) return;
    if (phase !== "idle") {
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
    setActiveQuestion("");
    pushChat({
      kind: "system",
      text: `房间切换为 ${next} 麦（满房 8–12 人）`,
    });
    setFeedback(`已切换为 ${next} 麦围桌`);
  };

  const spinnerSeat = seats[spinnerIndex];
  const targetSeat = targetIndex !== null ? seats[targetIndex] : null;
  const qaRoles = resolveQaRoles(spinnerSeat, targetSeat ?? undefined);
  const votingMale = voteTargetSeat(spinnerSeat, targetSeat ?? undefined);
  const showPairLink =
    (phase === "qa" || phase === "vote" || phase === "confirm") &&
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
        phase === "qa" || phase === "vote"
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
            <strong>官方心动房 #{String(OFFICIAL_ROOM_INDEX).padStart(2, "0")}</strong>
            <span>
              {occupiedCount}/{seatCount} 人 · ID 366998
            </span>
          </div>
          <span className="studioSpinBottleOfficialBadge">官方</span>
          <button type="button" className="studioSpinBottleIconBtn" aria-label="分享房间">
            <SystemIcon name="link" size={20} />
          </button>
        </header>

        <div className="studioSpinBottleColdStartBar" aria-label="冷启动状态">
          <span>
            固定房 {OFFICIAL_ROOM_INDEX}/{OFFICIAL_ROOM_TOTAL}
          </span>
          <span className="studioSpinBottleColdStartBarDivider" aria-hidden="true">
            ·
          </span>
          <span>{canStartGame ? "可开局" : "等待 >2 人"}</span>
          <span className="studioSpinBottleColdStartBarDivider" aria-hidden="true">
            ·
          </span>
          <span>AI 补位 {botCount}</span>
          <span className="studioSpinBottleColdStartBarFill" aria-hidden="true">
            <span style={{ width: `${(occupiedCount / seatCount) * 100}%` }} />
          </span>
        </div>

        <div className="studioSpinBottleTagRow" aria-label="房间标签">
          <span className="studioSpinBottleTag studioSpinBottleTag--pink">男女专属位</span>
          <span className="studioSpinBottleTag studioSpinBottleTag--gold">
            {QUESTION_LEVEL_LABEL[ROOM_QUESTION_LEVEL]}
          </span>
          <span className="studioSpinBottleTag">♀ 问 · ♂ 答</span>
          <span className="studioSpinBottleTag">合规题库</span>
          <button type="button" className="studioSpinBottleRoomGifts">
            <SystemIcon name="gift" size={14} />
            房主分成
          </button>
        </div>

        <div className="studioSpinBottleGuideTasks" aria-label="冷启动引导任务">
          {GUIDE_TASKS.map((task) => (
            <span
              key={task.id}
              className={[
                "studioSpinBottleGuideTask",
                task.done ? "studioSpinBottleGuideTask--done" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {task.done ? "✓" : "○"} {task.label}
            </span>
          ))}
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
              <span className="studioSpinBottleSeatPickerLabel">满房 8–12</span>
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
                  phase === "spinning" || phase === "qa"
                    ? "studioSpinBottleWaveform--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {WAVEFORM_BARS.map((barHeight, index) => (
                  <span
                    key={index}
                    className="studioSpinBottleWaveBar"
                    style={
                      {
                        "--bar-height": `${barHeight}px`,
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
              <span className="studioSpinBottleSpinHint">顺时针</span>
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

        {phase === "qa" && activeQuestion ? (
          <section className="studioSpinBottleQaCard" aria-label="真心话问答">
            <div className="studioSpinBottleQaCardHead">
              <span className="studioSpinBottleTag studioSpinBottleTag--gold">
                {QUESTION_LEVEL_LABEL[ROOM_QUESTION_LEVEL]}
              </span>
              <span className="studioSpinBottleQaCompliance">已合规审核</span>
            </div>
            <p className="studioSpinBottleQaQuestion">{activeQuestion}</p>
            <p className="studioSpinBottleQaRoles">
              <strong>{qaRoles.asker?.name ?? "女方"}</strong> 提问 ·{" "}
              <strong>{qaRoles.answerer?.name ?? "男方"}</strong> 作答
            </p>
            <p className="studioSpinBottleQaNote">
              题库 AI 生成 + 竞品采集 · 暂不开放用户出题
            </p>
            <button
              type="button"
              className="kitButton kitButton--height40 kitButton--primary studioSpinBottleQaBtn"
              onClick={finishQa}
            >
              回答完毕 · 进入投票
            </button>
          </section>
        ) : null}

        <div className="studioSpinBottleStateBar" aria-live="polite">
          <span>{PHASE_LABEL[phase]}</span>
          {phase === "idle" ? (
            <button
              type="button"
              className="studioSpinBottleSpinBtn"
              onClick={startSpin}
              disabled={!canStartGame}
            >
              顺时针 Spin ♡
            </button>
          ) : null}
          {phase === "vote" ? (
            <div className="studioSpinBottleVoteInline">
              <div className="studioSpinBottleVoteMeta">
                <span>@{votingMale?.name ?? "男方"} · 赞率 {voteProgress}%</span>
                <span className="studioSpinBottleVoteImmune">女性免疫请出</span>
              </div>
              <div className="studioSpinBottleVoteTrack">
                <span
                  className="studioSpinBottleVoteThreshold"
                  style={{ left: `${VOTE_PASS_THRESHOLD}%` }}
                  aria-hidden="true"
                />
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
            {occupiedCount}
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
            <input type="text" readOnly placeholder="公屏发言…" />
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
              <p>双向心动确认</p>
              <div className="studioSpinBottleSheetPair">
                <AvatarVisual size={48} src={spinnerSeat.avatar} alt="" />
                <span aria-hidden="true">♥</span>
                <AvatarVisual size={48} src={targetSeat.avatar} alt="" framed />
              </div>
              <p className="studioSpinBottleSheetNames">
                {spinnerSeat.name} & {targetSeat.name}
              </p>
              <p className="studioSpinBottleSheetRule">
                双方均选 Kiss 才进入 {QUESTION_LEVEL_LABEL[ROOM_QUESTION_LEVEL]} 真心话
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
  const auraTone = seat.gender === "female" ? "magenta" : "cyan";

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

      {seat.isBot ? (
        <span className="studioSpinBottleBotBadge" aria-label="AI 机器人">
          AI
        </span>
      ) : null}

      <span
        className={[
          "studioSpinBottleGenderBadge",
          seat.gender === "male"
            ? "studioSpinBottleGenderBadge--male"
            : "studioSpinBottleGenderBadge--female",
        ].join(" ")}
        aria-hidden="true"
      >
        {seat.gender === "male" ? "♂" : "♀"}
      </span>

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
              {seat.gender === "male" ? (
                <span className="studioSpinBottleMicPrice">{MALE_JOIN_PRICE}◆</span>
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
            锁定
          </span>
        ) : (
          <span className="studioSpinBottleMicName studioSpinBottleMicName--muted">
            {seat.gender === "male" ? `男席 · ${MALE_JOIN_PRICE}◆` : "女席 · Free"}
          </span>
        )}
      </div>
    </article>
  );
}
