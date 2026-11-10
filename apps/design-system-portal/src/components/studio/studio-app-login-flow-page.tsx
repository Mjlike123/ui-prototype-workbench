"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { SystemIcon } from "@/components/kit/system-icon";

type LoginScreen = "landing" | "phone" | "otp" | "id" | "success";
type Provider = "Apple" | "Google";

const LOGIN_HERO = "/prototypes/studio/app-login-hero.jpg";

const SCENARIOS: ReadonlyArray<{
  id: "flow" | "provider-error" | "phone-error" | "otp-error" | "success";
  label: string;
}> = [
  { id: "flow", label: "完整流程" },
  { id: "provider-error", label: "授权失败" },
  { id: "phone-error", label: "号码错误" },
  { id: "otp-error", label: "验证码错误" },
  { id: "success", label: "成功" },
];

export function StudioAppLoginFlowPage({
  width = 375,
  height = 812,
  theme = "light",
}: {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
}) {
  const [screen, setScreen] = useState<LoginScreen>("landing");
  const [providerLoading, setProviderLoading] = useState<Provider | null>(null);
  const [providerError, setProviderError] = useState("");
  const [countryCode, setCountryCode] = useState<"+86" | "+1">("+86");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [topTopId, setTopTopId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [idError, setIdError] = useState("");
  const [submittingId, setSubmittingId] = useState(false);
  const [loginMethod, setLoginMethod] = useState("手机号");
  const [enteredApp, setEnteredApp] = useState(false);
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0].id);
  const pageTitleRef = useRef<HTMLHeadingElement>(null);
  const otpTimerRef = useRef<number | undefined>(undefined);

  const normalizedPhone = phone.replace(/\D/g, "");
  const phoneLength = countryCode === "+86" ? 11 : 10;
  const phoneValid = normalizedPhone.length === phoneLength;
  const idReady = topTopId.trim().length >= 3 && password.length >= 6;
  const compact = height <= 700 && width < 800;
  const wide = width >= 800;

  useEffect(() => {
    if (screen !== "landing") {
      pageTitleRef.current?.focus();
    }
  }, [screen]);

  useEffect(() => {
    if (screen !== "otp" || countdown <= 0) return;
    const timer = window.setInterval(
      () => setCountdown((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [countdown, screen]);

  useEffect(
    () => () => {
      if (otpTimerRef.current) window.clearTimeout(otpTimerRef.current);
    },
    [],
  );

  const resetFlow = () => {
    setScreen("landing");
    setProviderLoading(null);
    setProviderError("");
    setPhone("");
    setPhoneError("");
    setSendingCode(false);
    setOtp("");
    setOtpError("");
    setVerifyingOtp(false);
    setCountdown(30);
    setTopTopId("");
    setPassword("");
    setIdError("");
    setSubmittingId(false);
    setEnteredApp(false);
  };

  const selectScenario = (scenario: (typeof SCENARIOS)[number]["id"]) => {
    setActiveScenario(scenario);
    resetFlow();
    if (scenario === "provider-error") {
      setProviderError("Apple 授权未完成，请重试或选择其他方式");
    } else if (scenario === "phone-error") {
      setScreen("phone");
      setPhone("13800");
      setPhoneError("请输入 11 位有效手机号");
    } else if (scenario === "otp-error") {
      setScreen("otp");
      setPhone("13800138000");
      setOtpError("验证码不正确，请重新输入");
      setCountdown(0);
    } else if (scenario === "success") {
      setLoginMethod("Apple");
      setScreen("success");
    }
  };

  const startProviderLogin = (provider: Provider) => {
    setProviderLoading(provider);
    setProviderError("");
    window.setTimeout(() => {
      setProviderLoading(null);
      setLoginMethod(provider);
      setScreen("success");
    }, 900);
  };

  const submitPhone = (event: FormEvent) => {
    event.preventDefault();
    if (!phoneValid) {
      setPhoneError(`请输入 ${phoneLength} 位有效手机号`);
      return;
    }
    setPhoneError("");
    setSendingCode(true);
    window.setTimeout(() => {
      setSendingCode(false);
      setOtp("");
      setCountdown(30);
      setScreen("otp");
    }, 650);
  };

  const submitId = (event: FormEvent) => {
    event.preventDefault();
    if (!idReady) return;
    setSubmittingId(true);
    setIdError("");
    window.setTimeout(() => {
      setSubmittingId(false);
      if (
        topTopId.trim().toLowerCase() === "toptop" &&
        password === "123456"
      ) {
        setLoginMethod("TopTop ID");
        setScreen("success");
        return;
      }
      setPassword("");
      setIdError("TopTop ID 或密码不正确");
    }, 700);
  };

  const updateOtp = (value: string) => {
    const nextOtp = value.replace(/\D/g, "").slice(0, 6);
    setOtp(nextOtp);
    setOtpError("");
    if (nextOtp.length !== 6) return;
    setVerifyingOtp(true);
    if (otpTimerRef.current) window.clearTimeout(otpTimerRef.current);
    otpTimerRef.current = window.setTimeout(() => {
      setVerifyingOtp(false);
      if (nextOtp === "123456") {
        setLoginMethod("手机号");
        setScreen("success");
        return;
      }
      setOtp("");
      setOtpError("验证码不正确，请重新输入");
    }, 700);
  };

  const returnToLanding = () => {
    setScreen("landing");
    setPhoneError("");
    setOtpError("");
    setIdError("");
  };

  return (
    <div
      className="studioLoginFlowShell"
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
    >
      <div className="studioLoginFlowControls" aria-label="登录流程状态预览">
        <div role="tablist" aria-label="演示状态">
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              role="tab"
              aria-selected={activeScenario === scenario.id}
              className={
                activeScenario === scenario.id
                  ? "studioLoginFlowControl studioLoginFlowControl--active"
                  : "studioLoginFlowControl"
              }
              onClick={() => selectScenario(scenario.id)}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={[
          "pageCanvasDevice",
          "studioLoginDevice",
          compact ? "studioLoginDevice--compact" : "",
          wide ? "studioLoginDevice--wide" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-theme={theme}
        aria-label="TopTop App 登录流程原型"
      >
        <IosStatusBar appearance="dark-content" />

        {screen === "landing" ? (
          <LoginLanding
            providerLoading={providerLoading}
            providerError={providerError}
            onProviderLogin={startProviderLogin}
            onPhone={() => {
              setActiveScenario("flow");
              setScreen("phone");
            }}
            onId={() => {
              setActiveScenario("flow");
              setScreen("id");
            }}
          />
        ) : null}

        {screen === "phone" ? (
          <AuthPageShell
            title="使用手机号登录"
            description="输入手机号，我们会发送一条验证码。"
            titleRef={pageTitleRef}
            onBack={returnToLanding}
          >
            <form className="studioLoginForm" onSubmit={submitPhone}>
              <label className="studioLoginFieldLabel" htmlFor="login-phone">
                手机号
              </label>
              <div
                className={`studioLoginField${
                  phoneError ? " studioLoginField--error" : ""
                }`}
              >
                <button
                  type="button"
                  className="studioLoginCountryCode"
                  aria-label={`国家或地区代码，当前 ${countryCode}`}
                  onClick={() =>
                    setCountryCode((value) => (value === "+86" ? "+1" : "+86"))
                  }
                >
                  {countryCode}
                  <SystemIcon name="chevronDown" size={14} />
                </button>
                <input
                  id="login-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={phone}
                  aria-invalid={Boolean(phoneError)}
                  aria-describedby={phoneError ? "login-phone-error" : undefined}
                  placeholder={
                    countryCode === "+86" ? "请输入 11 位手机号" : "请输入 10 位手机号"
                  }
                  maxLength={phoneLength}
                  onChange={(event) => {
                    setPhone(
                      event.target.value.replace(/\D/g, "").slice(0, phoneLength),
                    );
                    setPhoneError("");
                  }}
                  onBlur={() => {
                    if (phone && !phoneValid) {
                      setPhoneError(`请输入 ${phoneLength} 位有效手机号`);
                    }
                  }}
                />
                {phone ? (
                  <button
                    type="button"
                    className="studioLoginFieldAction"
                    aria-label="清除手机号"
                    onClick={() => {
                      setPhone("");
                      setPhoneError("");
                    }}
                  >
                    <SystemIcon name="close" size={16} />
                  </button>
                ) : null}
              </div>
              <p
                id="login-phone-error"
                className="studioLoginFieldMessage"
                aria-live="polite"
              >
                {phoneError || "仅用于登录与账号安全，不会公开展示"}
              </p>
              <button
                type="submit"
                className="kitButton kitButton--height48 kitButton--primary studioLoginPrimaryButton"
                disabled={!phoneValid || sendingCode}
              >
                {sendingCode ? (
                  <>
                    <span className="studioLoginSpinner" aria-hidden="true" />
                    正在发送
                  </>
                ) : (
                  "获取验证码"
                )}
              </button>
            </form>
          </AuthPageShell>
        ) : null}

        {screen === "otp" ? (
          <AuthPageShell
            title="输入验证码"
            description={`验证码已发送至 ${countryCode} ${maskPhone(phone)}`}
            titleRef={pageTitleRef}
            onBack={() => setScreen("phone")}
          >
            <div className="studioLoginForm">
              <label className="studioLoginFieldLabel" htmlFor="login-otp">
                六位验证码
              </label>
              <div
                className={`studioLoginOtp${
                  otpError ? " studioLoginOtp--error" : ""
                }`}
                onClick={() => document.getElementById("login-otp")?.focus()}
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <span
                    key={index}
                    className={
                      index === otp.length && !verifyingOtp
                        ? "studioLoginOtpSlot studioLoginOtpSlot--active"
                        : "studioLoginOtpSlot"
                    }
                  >
                    {otp[index] ?? ""}
                  </span>
                ))}
                <input
                  id="login-otp"
                  className="studioLoginOtpInput"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-invalid={Boolean(otpError)}
                  aria-describedby={otpError ? "login-otp-error" : undefined}
                  value={otp}
                  maxLength={6}
                  disabled={verifyingOtp}
                  onChange={(event) => updateOtp(event.target.value)}
                />
              </div>
              <div className="studioLoginOtpMeta">
                <p
                  id="login-otp-error"
                  className="studioLoginFieldMessage"
                  aria-live="polite"
                >
                  {verifyingOtp
                    ? "正在验证…"
                    : otpError || "原型成功码：123456"}
                </p>
                <button
                  type="button"
                  className="studioLoginTextButton"
                  disabled={countdown > 0}
                  onClick={() => {
                    setOtp("");
                    setOtpError("");
                    setCountdown(30);
                  }}
                >
                  {countdown > 0 ? `${countdown}s 后重发` : "重新发送验证码"}
                </button>
              </div>
              <button
                type="button"
                className="studioLoginChangeNumber"
                onClick={() => setScreen("phone")}
              >
                修改手机号
              </button>
            </div>
          </AuthPageShell>
        ) : null}

        {screen === "id" ? (
          <AuthPageShell
            title="使用 TopTop ID 登录"
            description="输入你的 TopTop ID 与密码。"
            titleRef={pageTitleRef}
            onBack={returnToLanding}
          >
            <form className="studioLoginForm" onSubmit={submitId}>
              <label className="studioLoginFieldLabel" htmlFor="login-id">
                TopTop ID
              </label>
              <div className="studioLoginField">
                <input
                  id="login-id"
                  type="text"
                  autoComplete="username"
                  value={topTopId}
                  placeholder="输入 TopTop ID"
                  onChange={(event) => {
                    setTopTopId(event.target.value);
                    setIdError("");
                  }}
                />
              </div>
              <label className="studioLoginFieldLabel" htmlFor="login-password">
                密码
              </label>
              <div
                className={`studioLoginField${
                  idError ? " studioLoginField--error" : ""
                }`}
              >
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  aria-invalid={Boolean(idError)}
                  aria-describedby={idError ? "login-id-error" : undefined}
                  placeholder="输入密码"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setIdError("");
                  }}
                />
                <button
                  type="button"
                  className="studioLoginPasswordToggle"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "隐藏" : "显示"}
                </button>
              </div>
              <p
                id="login-id-error"
                className="studioLoginFieldMessage"
                aria-live="polite"
              >
                {idError || "演示账号：toptop / 123456"}
              </p>
              <button
                type="submit"
                className="kitButton kitButton--height48 kitButton--primary studioLoginPrimaryButton"
                disabled={!idReady || submittingId}
              >
                {submittingId ? "正在登录…" : "登录"}
              </button>
              <button type="button" className="studioLoginTextButton">
                忘记密码？
              </button>
            </form>
          </AuthPageShell>
        ) : null}

        {screen === "success" ? (
          <main className="studioLoginSuccess">
            <div className="studioLoginSuccessVisual" aria-hidden="true">
              <Image
                src={LOGIN_HERO}
                alt=""
                width={240}
                height={320}
                priority
              />
              <span className="studioLoginSuccessBadge">✓</span>
            </div>
            <p className="studioLoginEyebrow">WELCOME TO TOPTOP</p>
            <h1 ref={pageTitleRef} tabIndex={-1}>
              登录成功
            </h1>
            <p>已通过 {loginMethod} 完成身份验证。</p>
            <button
              type="button"
              className="kitButton kitButton--height48 kitButton--primary studioLoginSuccessButton"
              onClick={() => setEnteredApp(true)}
            >
              {enteredApp ? "已进入首页" : "进入 TopTop"}
            </button>
            {enteredApp ? (
              <p className="studioLoginEntered" role="status">
                主任务完成：TopTop 首页已就绪
              </p>
            ) : null}
            <button
              type="button"
              className="studioLoginTextButton"
              onClick={() => {
                setActiveScenario("flow");
                resetFlow();
              }}
            >
              使用其他账号
            </button>
          </main>
        ) : null}

        <div className="studioLoginHomeArea" aria-hidden="true">
          <span className="bottomNavigationHomeIndicator" />
        </div>
      </div>
    </div>
  );
}

function LoginLanding({
  providerLoading,
  providerError,
  onProviderLogin,
  onPhone,
  onId,
}: {
  providerLoading: Provider | null;
  providerError: string;
  onProviderLogin: (provider: Provider) => void;
  onPhone: () => void;
  onId: () => void;
}) {
  return (
    <main className="studioLoginLanding">
      <section className="studioLoginHero" aria-labelledby="login-hero-title">
        <Image
          src={LOGIN_HERO}
          alt="Toppy 戴着耳机穿过青色入口，进入充满对话与星星的社交世界"
          fill
          sizes="(min-width: 800px) 445px, 100vw"
          priority
        />
        <div className="studioLoginHeroCopy">
          <p className="studioLoginEyebrow">MEET · PLAY · BELONG</p>
          <h1 id="login-hero-title">一起进入好玩的世界</h1>
        </div>
      </section>

      <section className="studioLoginActions" aria-label="选择登录方式">
        <div className="studioLoginWelcome">
          <h2>欢迎来到 TopTop</h2>
          <p>登录后继续和朋友聊天、游戏与相遇。</p>
        </div>

        <p className="studioLoginLastUsed">上次登录 · Apple</p>
        <button
          type="button"
          className="studioLoginProvider studioLoginProvider--apple"
          disabled={Boolean(providerLoading)}
          onClick={() => onProviderLogin("Apple")}
        >
          <ProviderMark provider="Apple" />
          <span>
            {providerLoading === "Apple" ? "正在连接 Apple…" : "使用 Apple 继续"}
          </span>
        </button>
        <button
          type="button"
          className="studioLoginProvider studioLoginProvider--google"
          disabled={Boolean(providerLoading)}
          onClick={() => onProviderLogin("Google")}
        >
          <ProviderMark provider="Google" />
          <span>
            {providerLoading === "Google"
              ? "正在连接 Google…"
              : "使用 Google 继续"}
          </span>
        </button>

        {providerError ? (
          <div className="studioLoginInlineError" role="alert">
            <span>{providerError}</span>
            <button type="button" onClick={() => onProviderLogin("Apple")}>
              重试
            </button>
          </div>
        ) : null}

        <div className="studioLoginDivider" aria-hidden="true">
          <span>或使用</span>
        </div>
        <div className="studioLoginAlternatives">
          <button type="button" onClick={onPhone}>
            <span className="studioLoginAlternativeMark">#</span>
            手机号
          </button>
          <button type="button" onClick={onId}>
            <span className="studioLoginAlternativeMark">TT</span>
            TopTop ID
          </button>
        </div>
        <p className="studioLoginLegal">
          继续即表示你同意
          <button type="button">服务条款</button>
          和
          <button type="button">隐私政策</button>
        </p>
      </section>
    </main>
  );
}

function AuthPageShell({
  title,
  description,
  titleRef,
  onBack,
  children,
}: {
  title: string;
  description: string;
  titleRef: React.RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <main className="studioLoginAuthPage">
      <aside className="studioLoginAuthArt" aria-hidden="true">
        <Image src={LOGIN_HERO} alt="" fill sizes="445px" priority />
      </aside>
      <section className="studioLoginAuthPanel">
        <button
          type="button"
          className="studioLoginBack"
          aria-label="返回登录方式"
          onClick={onBack}
        >
          <SystemIcon name="back" size={24} />
        </button>
        <header className="studioLoginAuthHeader">
          <p className="studioLoginEyebrow">SECURE SIGN IN</p>
          <h1 ref={titleRef} tabIndex={-1}>
            {title}
          </h1>
          <p>{description}</p>
        </header>
        {children}
      </section>
    </main>
  );
}

function ProviderMark({ provider }: { provider: Provider }) {
  return (
    <span
      className={`studioLoginProviderMark studioLoginProviderMark--${provider.toLowerCase()}`}
      aria-hidden="true"
    >
      {provider === "Apple" ? "" : "G"}
    </span>
  );
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7) return digits || "手机号";
  return `${digits.slice(0, 3)} •••• ${digits.slice(-4)}`;
}
