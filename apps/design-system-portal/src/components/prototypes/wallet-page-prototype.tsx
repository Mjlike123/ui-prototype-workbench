"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { RegularNavigation } from "@/components/kit/regular-navigation";

type WalletPagePrototypeProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack: () => void;
};

type CoinSku = {
  id: string;
  coins: number;
  price: string;
  bonus?: number;
  popular?: boolean;
};

const coinSkus: CoinSku[] = [
  { id: "sku-60", coins: 60, price: "$0.99" },
  { id: "sku-300", coins: 300, price: "$4.99", bonus: 20 },
  { id: "sku-600", coins: 600, price: "$9.99", bonus: 60, popular: true },
  { id: "sku-1200", coins: 1200, price: "$19.99", bonus: 150 },
  { id: "sku-3000", coins: 3000, price: "$49.99", bonus: 450 },
  { id: "sku-6000", coins: 6000, price: "$99.99", bonus: 1000 },
];

export function WalletPagePrototype({
  width = 375,
  height = 812,
  theme = "light",
  onBack,
}: WalletPagePrototypeProps) {
  const [toast, setToast] = useState<string | null>(null);

  const purchaseSku = (sku: CoinSku) => {
    setToast(`跳转系统购买 · ${sku.coins.toLocaleString("en-US")} coins · ${sku.price}`);
  };

  return (
    <div
      className="pageCanvasDevice walletPrototypeDevice"
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`My coins 二级页面原型 · ${width}×${height}`}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />

      <div className="pageCanvasContentShell">
        <RegularNavigation title="My coins" onBack={onBack} />

        <main className="walletPrototypeScroll">
          <PrototypeWalletCoinBalance balance={12580} />

          <section
            className="walletPrototypeSkuSection"
            aria-labelledby="wallet-buy-coins"
          >
            <h2 id="wallet-buy-coins">Buy coins</h2>
            <PrototypeWalletCoinSkuGrid skus={coinSkus} onPurchase={purchaseSku} />
          </section>
        </main>
      </div>

      {toast ? (
        <div className="profilePrototypeToast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function PrototypeWalletCoinBalance({ balance }: { balance: number }) {
  return (
    <section className="walletPrototypeBalance" aria-label="My coins balance">
      <Image
        src="/icons/product/toptop-coin.png"
        alt=""
        width={40}
        height={40}
        aria-hidden="true"
      />
      <p className="walletPrototypeBalanceLabel">My coins</p>
      <strong>{balance.toLocaleString("en-US")}</strong>
    </section>
  );
}

function PrototypeWalletCoinSkuGrid({
  skus,
  onPurchase,
}: {
  skus: readonly CoinSku[];
  onPurchase: (sku: CoinSku) => void;
}) {
  return (
    <div className="walletPrototypeSkuGrid" role="group" aria-label="Buy coins packages">
      {skus.map((sku) => (
        <button
          key={sku.id}
          type="button"
          className={[
            "walletPrototypeSkuCard",
            sku.popular ? "walletPrototypeSkuCard--popular" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={`购买 ${sku.coins.toLocaleString("en-US")} coins，${sku.price}${
            sku.bonus ? `，额外赠送 ${sku.bonus} coins` : ""
          }`}
          onClick={() => onPurchase(sku)}
        >
          {sku.popular ? (
            <span className="walletPrototypeSkuBadge">Popular</span>
          ) : null}
          <span className="walletPrototypeSkuCoins">
            <Image
              src="/icons/product/toptop-coin.png"
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
            />
            <strong>{sku.coins.toLocaleString("en-US")}</strong>
          </span>
          {sku.bonus ? (
            <span className="walletPrototypeSkuBonus">+{sku.bonus}</span>
          ) : (
            <span className="walletPrototypeSkuBonus walletPrototypeSkuBonus--empty" />
          )}
          <span className="walletPrototypeSkuPrice">{sku.price}</span>
        </button>
      ))}
    </div>
  );
}
