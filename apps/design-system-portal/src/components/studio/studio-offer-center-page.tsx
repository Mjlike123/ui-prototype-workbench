"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CenterDialog } from "@/components/kit/center-dialog";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { SystemIcon } from "@/components/kit/system-icon";
import { Toast } from "@/components/kit/toast";
import { UnderlineSecondaryTab } from "@/components/kit/underline-secondary-tab";

type OfferTab = "active" | "available";

type StudioOfferCenterPageProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack?: () => void;
};

type Milestone = {
  amount: number;
  coins: number;
  extra: string;
};

type CoinPackage = {
  id: string;
  coins: number;
  price: number;
  bonus?: string;
};

const OFFER_TABS = [
  { key: "active", label: "Active" },
  { key: "available", label: "Available" },
] as const;

const MILESTONES: Milestone[] = [
  { amount: 10, coins: 125_000, extra: "Profile ring · 3 days" },
  { amount: 20, coins: 225_000, extra: "Galaxy frame · 30 days" },
  { amount: 30, coins: 375_000, extra: "Room card · 60 days" },
];

const COIN_PACKAGES: readonly CoinPackage[] = [
  { id: "coins-1", coins: 16_875, price: 0.99 },
  { id: "coins-2", coins: 88_425, price: 4.99, bonus: "4% OFF" },
  { id: "coins-3", coins: 184_725, price: 9.99, bonus: "8% OFF" },
  { id: "coins-4", coins: 377_775, price: 19.99, bonus: "11% OFF" },
  { id: "coins-5", coins: 964_350, price: 49.99, bonus: "12% OFF" },
  { id: "coins-6", coins: 2_009_025, price: 99.99, bonus: "14% OFF" },
];

export function StudioOfferCenterPage({
  width = 375,
  height = 812,
  theme = "light",
  onBack,
}: StudioOfferCenterPageProps) {
  const [tab, setTab] = useState<OfferTab>("active");
  const [showHistory, setShowHistory] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState("coins-3");
  const [recharged, setRecharged] = useState(12);
  const [balance, setBalance] = useState(3_432);
  const [claimed, setClaimed] = useState<number[]>([10]);
  const [reward, setReward] = useState<Milestone | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedPackage =
    COIN_PACKAGES.find((item) => item.id === selectedPackageId) ??
    COIN_PACKAGES[2];
  const nextMilestone = MILESTONES.find((item) => item.amount > recharged);

  const completeRecharge = () => {
    const nextProgress = Math.min(30, recharged + selectedPackage.price);
    setRecharged(nextProgress);
    setBalance((current) => current + selectedPackage.coins);
    setRechargeOpen(false);
    setToast(
      nextProgress >= 20 && recharged < 20
        ? "Recharge successful · $20 reward unlocked"
        : "Recharge successful · Offer progress updated",
    );
  };

  const claimReward = (milestone: Milestone) => {
    setClaimed((current) => [...current, milestone.amount]);
    setBalance((current) => current + milestone.coins);
    setToast(null);
    setReward(milestone);
  };

  return (
    <div
      className={[
        "pageCanvasDevice",
        "studioOfferCenterDevice",
        theme === "dark" ? "studioOfferCenterDevice--dark" : "",
      ].join(" ")}
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`Offer Center 优化原型 · ${width}×${height}`}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />

      <div className="pageCanvasContentShell">
        {showHistory ? (
          <OfferHistory onBack={() => setShowHistory(false)} />
        ) : (
          <>
            <RegularNavigation
              title="Offer Center"
              onBack={onBack}
              trailing={
                <button
                  type="button"
                  className="studioOfferHistoryAction"
                  aria-label="History"
                  onClick={() => setShowHistory(true)}
                >
                  <SystemIcon name="history" size={24} />
                </button>
              }
              trailingKind="icon"
            />
            <UnderlineSecondaryTab
              items={OFFER_TABS}
              value={tab}
              onChange={(key) => setTab(key as OfferTab)}
              ariaLabel="Offer categories"
            />

            {tab === "active" ? (
              <ActiveOffer
                recharged={recharged}
                claimed={claimed}
                nextMilestone={nextMilestone}
                onRecharge={() => setRechargeOpen(true)}
                onClaim={claimReward}
              />
            ) : (
              <AvailableOffers
                onActivate={(title) => {
                  setTab("active");
                  setToast(`${title} activated`);
                }}
              />
            )}
          </>
        )}
      </div>

      {rechargeOpen ? (
        <PrototypeOfferRechargeSheet
          balance={balance}
          selectedPackageId={selectedPackageId}
          onSelect={setSelectedPackageId}
          onClose={() => setRechargeOpen(false)}
          onRecharge={completeRecharge}
        />
      ) : null}

      <CenterDialog
        open={Boolean(reward)}
        title={reward ? `${reward.coins.toLocaleString("en-US")} coins` : ""}
        description={
          reward
            ? `${reward.extra} has also been added to your account.`
            : undefined
        }
        illustration={
          <Image
            src="/icons/product/toptop-coin.png"
            alt=""
            width={84}
            height={84}
            aria-hidden="true"
          />
        }
        actions={[
          {
            id: "done",
            label: "Got it",
            onPress: () => setReward(null),
          },
        ]}
      />

      {toast ? (
        <div className="studioOfferToast">
          <Toast message={toast} />
        </div>
      ) : null}
    </div>
  );
}

function ActiveOffer({
  recharged,
  claimed,
  nextMilestone,
  onRecharge,
  onClaim,
}: {
  recharged: number;
  claimed: number[];
  nextMilestone: Milestone | undefined;
  onRecharge: () => void;
  onClaim: (milestone: Milestone) => void;
}) {
  const progress = Math.min(100, (recharged / 30) * 100);
  const remaining = nextMilestone
    ? Math.max(0, nextMilestone.amount - recharged)
    : 0;

  return (
    <>
      <main className="studioOfferScroll studioOfferScroll--withFixedCta">
        <section
          className="studioOfferSummary"
          aria-labelledby="monthly-offer-title"
        >
          <div className="studioOfferSummaryHead">
            <div>
              <span className="studioOfferLiveBadge">ACTIVE</span>
              <h2 id="monthly-offer-title">Monthly Offer</h2>
            </div>
            <span className="studioOfferDays">20 days left</span>
          </div>

          <div className="studioOfferProgressCopy">
            <div>
              <small>Recharge progress</small>
              <strong>${recharged.toFixed(2)} / $30.00</strong>
            </div>
            <span>{Math.round(progress)}%</span>
          </div>
          <div
            className="studioOfferProgress"
            role="progressbar"
            aria-label="Monthly offer recharge progress"
            aria-valuemin={0}
            aria-valuemax={30}
            aria-valuenow={Math.round(recharged)}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <p className="studioOfferNextGoal">
            {nextMilestone
              ? `Recharge $${remaining.toFixed(2)} more to unlock ${nextMilestone.coins.toLocaleString("en-US")} coins`
              : "All monthly rewards unlocked"}
          </p>
        </section>

        <section
          className="studioOfferMilestones"
          aria-labelledby="offer-rewards-title"
        >
          <div className="studioOfferSectionHead">
            <div>
              <h2 id="offer-rewards-title">Rewards</h2>
              <p>Each recharge counts automatically</p>
            </div>
            <span>
              {claimed.length}/{MILESTONES.length} claimed
            </span>
          </div>

          <ol>
            {MILESTONES.map((milestone, index) => {
              const unlocked = recharged >= milestone.amount;
              const isClaimed = claimed.includes(milestone.amount);
              return (
                <li
                  key={milestone.amount}
                  className={[
                    "studioOfferMilestone",
                    unlocked ? "studioOfferMilestone--unlocked" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="studioOfferMilestoneIndex">
                    {isClaimed ? "✓" : index + 1}
                  </span>
                  <div className="studioOfferMilestoneBody">
                    <div className="studioOfferMilestoneTitle">
                      <strong>Reach ${milestone.amount}</strong>
                      <span>{unlocked ? "Unlocked" : "Locked"}</span>
                    </div>
                    <div className="studioOfferRewardRow">
                      <span>
                        <Image
                          src="/icons/product/toptop-coin.png"
                          alt=""
                          width={24}
                          height={24}
                          aria-hidden="true"
                        />
                        {milestone.coins.toLocaleString("en-US")}
                      </span>
                      <span>
                        <SystemIcon name="gift" size={20} />
                        {milestone.extra}
                      </span>
                    </div>
                  </div>
                  {unlocked && !isClaimed ? (
                    <button
                      type="button"
                      className="kitButton kitButton--height32 kitButton--primary"
                      onClick={() => onClaim(milestone)}
                    >
                      Claim
                    </button>
                  ) : (
                    <span className="studioOfferMilestoneState">
                      {isClaimed
                        ? "Claimed"
                        : `$${milestone.amount - recharged > 0 ? (milestone.amount - recharged).toFixed(2) : "0.00"} left`}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      </main>

      <div className="studioOfferCtaDock">
        <button
          type="button"
          className="kitButton kitButton--height48 kitButton--primary"
          onClick={onRecharge}
        >
          {nextMilestone
            ? `Recharge to unlock $${nextMilestone.amount} reward`
            : "Recharge coins"}
        </button>
      </div>
    </>
  );
}

function AvailableOffers({
  onActivate,
}: {
  onActivate: (title: string) => void;
}) {
  return (
    <main className="studioOfferScroll studioOfferAvailable">
      <header>
        <h2>Available offers</h2>
        <p>Activate one offer at a time. Progress starts after activation.</p>
      </header>
      {[
        {
          title: "VIP Experience Offer",
          description: "Recharge $20 within 14 days",
          reward: "VIP access · 7 days + 180,000 coins",
        },
        {
          title: "20% Coins Back",
          description: "Recharge $50 within 30 days",
          reward: "Up to 400,000 bonus coins",
        },
      ].map((offer) => (
        <article key={offer.title} className="studioOfferAvailableCard">
          <span className="studioOfferAvailableIcon">
            <SystemIcon name="gift" size={24} />
          </span>
          <div>
            <h3>{offer.title}</h3>
            <p>{offer.description}</p>
            <strong>{offer.reward}</strong>
          </div>
          <button
            type="button"
            className="kitButton kitButton--height32 kitButton--primary-outline"
            onClick={() => onActivate(offer.title)}
          >
            Activate
          </button>
        </article>
      ))}
    </main>
  );
}

function OfferHistory({ onBack }: { onBack: () => void }) {
  return (
    <>
      <RegularNavigation title="Offer history" onBack={onBack} />
      <main className="studioOfferScroll studioOfferHistory">
        <header>
          <h2>Your previous offers</h2>
          <p>Rewards remain visible after an offer ends.</p>
        </header>
        {[
          {
            title: "100% VIP Experience Offer",
            date: "Aug 1–30",
            result: "Completed",
            reward: "VIP access · 7 days",
          },
          {
            title: "Monthly Offer",
            date: "Jul 1–31",
            result: "Completed",
            reward: "725,000 coins claimed",
          },
          {
            title: "20% Coins Back",
            date: "Jun 10–24",
            result: "Expired",
            reward: "$18 of $50 completed",
          },
        ].map((item) => (
          <article
            key={`${item.title}-${item.date}`}
            className="studioOfferHistoryItem"
          >
            <div>
              <h3>{item.title}</h3>
              <p>{item.date}</p>
              <strong>{item.reward}</strong>
            </div>
            <span
              className={
                item.result === "Completed"
                  ? "studioOfferHistoryStatus studioOfferHistoryStatus--complete"
                  : "studioOfferHistoryStatus"
              }
            >
              {item.result}
            </span>
          </article>
        ))}
      </main>
    </>
  );
}

function PrototypeOfferRechargeSheet({
  balance,
  selectedPackageId,
  onSelect,
  onClose,
  onRecharge,
}: {
  balance: number;
  selectedPackageId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  onRecharge: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const selected =
    COIN_PACKAGES.find((item) => item.id === selectedPackageId) ??
    COIN_PACKAGES[2];

  return (
    <div
      className="feedComposeOverlay studioOfferRechargeOverlay"
      role="presentation"
    >
      <button
        type="button"
        className="feedComposeOverlayBackdrop"
        aria-label="Close My coins"
        onClick={onClose}
      />
      <section
        className="feedComposeMediaSheet studioOfferRechargeSheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-recharge-title"
      >
        <header className="studioOfferRechargeHeader">
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close My coins"
            onClick={onClose}
          >
            <SystemIcon name="close" size={24} />
          </button>
          <h2 id="offer-recharge-title">My coins</h2>
          <span aria-hidden="true" />
        </header>

        <div className="studioOfferBalance">
          <Image
            src="/icons/product/toptop-coin.png"
            alt=""
            width={28}
            height={28}
            aria-hidden="true"
          />
          <span>
            <small>Current balance</small>
            <strong>{balance.toLocaleString("en-US")}</strong>
          </span>
        </div>

        <div
          className="studioOfferCoinGrid"
          role="radiogroup"
          aria-label="Coin packages"
        >
          {COIN_PACKAGES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={item.id === selectedPackageId}
              className={
                item.id === selectedPackageId
                  ? "studioOfferCoinPack studioOfferCoinPack--selected"
                  : "studioOfferCoinPack"
              }
              onClick={() => onSelect(item.id)}
            >
              {item.bonus ? <small>{item.bonus}</small> : null}
              <Image
                src="/icons/product/toptop-coin.png"
                alt=""
                width={32}
                height={32}
                aria-hidden="true"
              />
              <strong>{item.coins.toLocaleString("en-US")}</strong>
              <span>${item.price.toFixed(2)}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="kitButton kitButton--height48 kitButton--primary studioOfferRechargeButton"
          onClick={onRecharge}
        >
          Recharge ${selected.price.toFixed(2)}
        </button>
        <p className="studioOfferRechargeLegal">
          Taxes may apply · Secure payment
        </p>
      </section>
    </div>
  );
}
