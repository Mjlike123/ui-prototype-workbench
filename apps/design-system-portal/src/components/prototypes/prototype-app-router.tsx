"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MePagePrototype } from "@/components/prototypes/me-page-prototype";
import { MeSecondaryPrototype } from "@/components/prototypes/me-secondary-prototypes";
import { FeedComposePagePrototype } from "@/components/prototypes/feed-compose-page-prototype";
import { FeedDetailPagePrototype } from "@/components/prototypes/feed-detail-page-prototype";
import { WalletPagePrototype } from "@/components/prototypes/wallet-page-prototype";
import { PrototypeAppNavigationHost } from "@/components/prototypes/prototype-app-navigation-host";
import {
  PrivateChatPrototype,
  type PrivateChatFriend,
} from "@/components/prototypes/private-chat-prototype";
import { ProfilePagePrototype } from "@/components/prototypes/profile-page-prototype";
import { PrototypeDestinationPage } from "@/components/prototypes/prototype-destination-page";
import { SearchPagePrototype } from "@/components/prototypes/search-page-prototype";
import { TopTopHomePrototype } from "@/components/prototypes/toptop-home-prototype";
import {
  PROTOTYPE_NAV_PUSH_MS,
  isPrototypeTabSwitch,
  prefersReducedMotionNavigation,
  shouldPrototypePop,
  shouldPrototypePush,
} from "@/lib/prototype-app-navigation";
import type { PrototypeNavTransition } from "@/lib/prototype-app-navigation-types";
import type {
  MeSecondaryScreen,
  PrototypeAppScreen,
} from "@/lib/prototype-app-routes";

export function PrototypeAppRouter({
  screen,
  width = 375,
  height = 812,
  theme = "light",
  onPreviewNavigate,
  searchReturnScreen = "toptop",
  privateChatFriend,
  onPrivateChatFriendChange,
}: {
  screen: PrototypeAppScreen;
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onPreviewNavigate?: (screen: PrototypeAppScreen) => void;
  searchReturnScreen?: PrototypeAppScreen;
  privateChatFriend?: PrivateChatFriend;
  onPrivateChatFriendChange?: (friend: PrivateChatFriend) => void;
}) {
  const router = useRouter();
  const [stack, setStack] = useState<PrototypeAppScreen[]>(() => [screen]);
  const [transition, setTransition] = useState<PrototypeNavTransition | null>(
    null,
  );
  const transitionTimer = useRef<number | null>(null);
  const pendingRoute = useRef<{
    to: PrototypeAppScreen;
    friend?: PrivateChatFriend;
  } | null>(null);
  const internallyNotifiedScreen = useRef<PrototypeAppScreen | null>(null);
  const [localPrivateChatFriend, setLocalPrivateChatFriend] =
    useState<PrivateChatFriend>({
      id: "andrew",
      name: "Andrew",
      avatar: "/prototypes/feed/andrew-avatar.png",
    });
  const activePrivateChatFriend =
    privateChatFriend ?? localPrivateChatFriend;

  const activeScreen = stack[stack.length - 1] ?? screen;

  useEffect(() => {
    if (internallyNotifiedScreen.current === screen) {
      internallyNotifiedScreen.current = null;
      return;
    }
    setStack([screen]);
    setTransition(null);
    pendingRoute.current = null;
    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
  }, [screen]);

  useEffect(
    () => () => {
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current);
      }
    },
    [],
  );

  const notifyRouteChange = useCallback(
    (destination: PrototypeAppScreen) => {
      if (!onPreviewNavigate) return;
      internallyNotifiedScreen.current = destination;
      onPreviewNavigate(destination);
    },
    [onPreviewNavigate],
  );

  const pushUrl = useCallback(
    (destination: PrototypeAppScreen, friend?: PrivateChatFriend) => {
      if (onPreviewNavigate) return;
      if (destination === "private-chat" && friend) {
        const query = new URLSearchParams({
          theme,
          width: String(width),
          height: String(height),
          friendId: friend.id,
          friendName: friend.name,
          friendAvatar: friend.avatar,
        });
        router.push(
          `/prototype-runtime/app/private-chat?${query.toString()}`,
        );
        return;
      }
      router.push(
        `/prototype-runtime/app/${destination}?theme=${theme}&width=${width}&height=${height}`,
      );
    },
    [height, onPreviewNavigate, router, theme, width],
  );

  const completeTransition = useCallback(() => {
    const pending = pendingRoute.current;
    if (!pending) return;
    pendingRoute.current = null;
    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
    setTransition(null);
    pushUrl(pending.to, pending.friend);
  }, [pushUrl]);

  const runTransition = useCallback(
    (
      phase: PrototypeNavTransition["phase"],
      from: PrototypeAppScreen,
      to: PrototypeAppScreen,
      nextStack: PrototypeAppScreen[],
      friend?: PrivateChatFriend,
    ) => {
      notifyRouteChange(to);
      setStack(nextStack);

      if (prefersReducedMotionNavigation()) {
        setTransition(null);
        pushUrl(to, friend);
        return;
      }

      pendingRoute.current = { to, friend };
      setTransition({ phase, from, to });
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current);
      }
      transitionTimer.current = window.setTimeout(
        completeTransition,
        PROTOTYPE_NAV_PUSH_MS + 80,
      );
    },
    [completeTransition, notifyRouteChange, pushUrl],
  );

  const navigate = useCallback(
    (destination: PrototypeAppScreen, friend?: PrivateChatFriend) => {
      const current = stack[stack.length - 1] ?? screen;
      if (current === destination) return;

      if (
        stack.length >= 2 &&
        stack[stack.length - 1] === current &&
        stack[stack.length - 2] === destination
      ) {
        runTransition(
          "pop",
          current,
          destination,
          stack.slice(0, -1),
          friend,
        );
        return;
      }

      if (isPrototypeTabSwitch(current, destination)) {
        setTransition(null);
        setStack([destination]);
        notifyRouteChange(destination);
        pushUrl(destination, friend);
        return;
      }

      if (shouldPrototypePush(current, destination)) {
        runTransition("push", current, destination, [...stack, destination], friend);
        return;
      }

      if (shouldPrototypePop(current, destination)) {
        const nextStack =
          stack[stack.length - 1] === destination
            ? stack.slice(0, -1)
            : [destination];
        runTransition("pop", current, destination, nextStack, friend);
        return;
      }

      setTransition(null);
      setStack([destination]);
      notifyRouteChange(destination);
      pushUrl(destination, friend);
    },
    [
      notifyRouteChange,
      pushUrl,
      runTransition,
      screen,
      stack,
    ],
  );

  const renderScreen = useCallback(
    (target: PrototypeAppScreen): ReactNode => {
      if (target === "toptop") {
        return (
          <TopTopHomePrototype
            width={width}
            height={height}
            onNavigate={navigate}
            onOpenProfile={() => navigate("profile")}
            onOpenSearch={() => navigate("search")}
          />
        );
      }

      if (target === "me") {
        return (
          <MePagePrototype
            width={width}
            height={height}
            theme={theme}
            onNavigate={navigate}
            onOpenProfile={() => navigate("profile")}
            onOpenSecondary={navigate}
          />
        );
      }

      if (target === "profile") {
        return (
          <ProfilePagePrototype
            width={width}
            height={height}
            theme={theme}
            onNavigate={navigate}
            onBack={() => navigate("me")}
            onOpenCompose={() => navigate("feed-compose")}
          />
        );
      }

      if (target === "search") {
        return (
          <SearchPagePrototype
            width={width}
            height={height}
            theme={theme}
            autoFocus={transition === null}
            onBack={() => navigate(searchReturnScreen)}
          />
        );
      }

      if (target === "private-chat") {
        return (
          <PrivateChatPrototype
            friend={activePrivateChatFriend}
            width={width}
            height={height}
            theme={theme}
            onBack={() => navigate("message")}
          />
        );
      }

      if (target === "wallet") {
        return (
          <WalletPagePrototype
            width={width}
            height={height}
            theme={theme}
            onBack={() => navigate("me")}
          />
        );
      }

      if (target === "feed-compose") {
        const returnScreen =
          stack.length >= 2 ? stack[stack.length - 2]! : "feed";
        return (
          <FeedComposePagePrototype
            width={width}
            height={height}
            theme={theme}
            onBack={() => navigate(returnScreen)}
            onPublished={() => navigate("feed")}
          />
        );
      }

      if (target === "feed-detail") {
        const returnScreen =
          stack.length >= 2 ? stack[stack.length - 2]! : "feed";
        return (
          <FeedDetailPagePrototype
            width={width}
            height={height}
            theme={theme}
            onBack={() => navigate(returnScreen)}
          />
        );
      }

      if (
        target === "community-guidelines" ||
        target === "help" ||
        target === "settings"
      ) {
        return (
          <MeSecondaryPrototype
            screen={target as MeSecondaryScreen}
            width={width}
            height={height}
            theme={theme}
            onBack={() => navigate("me")}
          />
        );
      }

      return (
        <PrototypeDestinationPage
          screen={target}
          width={width}
          height={height}
          theme={theme}
          onNavigate={navigate}
          onOpenSearch={() => navigate("search")}
          onOpenPrivateChat={(friend) => {
            setLocalPrivateChatFriend(friend);
            onPrivateChatFriendChange?.(friend);
            navigate("private-chat", friend);
          }}
          onOpenCompose={() => navigate("feed-compose")}
          onOpenFeedDetail={() => navigate("feed-detail")}
        />
      );
    },
    [
      activePrivateChatFriend,
      height,
      navigate,
      onPrivateChatFriendChange,
      searchReturnScreen,
      theme,
      transition,
      width,
      stack,
    ],
  );

  const phase = transition?.phase ?? "idle";

  return (
    <PrototypeAppNavigationHost
      phase={phase}
      activeKey={activeScreen}
      fromKey={transition?.from}
      toKey={transition?.to}
      durationMs={PROTOTYPE_NAV_PUSH_MS}
      onTransitionEnd={completeTransition}
      fromPane={transition ? renderScreen(transition.from) : null}
      toPane={transition ? renderScreen(transition.to) : null}
    >
      {renderScreen(activeScreen)}
    </PrototypeAppNavigationHost>
  );
}
