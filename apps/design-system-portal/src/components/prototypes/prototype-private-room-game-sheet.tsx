"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { useTimedPresence } from "@/lib/use-timed-presence";

export type PrivateRoomGameOption = {
  name: string;
  image: string;
};

type PrototypePrivateRoomGameSheetProps = {
  open: boolean;
  games: readonly PrivateRoomGameOption[];
  onDismiss: () => void;
  onCreateRoom: (game: PrivateRoomGameOption) => void;
};

const EXIT_MS = 200;
const FOCUS_DELAY_MS = 200;

export function PrototypePrivateRoomGameSheet({
  open,
  games,
  onDismiss,
  onCreateRoom,
}: PrototypePrivateRoomGameSheetProps) {
  const panelRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const presence = useTimedPresence(open, EXIT_MS);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      setSelectedName(null);
    }
    wasOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (presence.mounted) return;
    restoreFocusRef.current?.focus({ preventScroll: true });
    restoreFocusRef.current = null;
  }, [presence.mounted]);

  useEffect(() => {
    if (!presence.mounted || presence.phase === "exit") return;

    const panel = panelRef.current;
    if (!panel) return;

    const getFocusable = () =>
      panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );

    const focusTimer = window.setTimeout(() => {
      getFocusable()[0]?.focus({ preventScroll: true });
    }, FOCUS_DELAY_MS);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onDismiss, presence.mounted, presence.phase]);

  if (!presence.mounted) return null;

  const selectedGame =
    games.find((game) => game.name === selectedName) ?? null;

  return (
    <div
      className={[
        "prototypePrivateRoomOverlay",
        presence.phase === "exit"
          ? "prototypePrivateRoomOverlay--exit"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-state={presence.phase}
      role="presentation"
    >
      <button
        type="button"
        className="prototypePrivateRoomBackdrop"
        aria-label="Dismiss game selection"
        onClick={onDismiss}
      />
      <section
        ref={panelRef}
        className="prototypePrivateRoomSheet"
        role="dialog"
        aria-modal="true"
        aria-label="Choose a game for your private room"
        data-kit-gap="game-selection-sheet"
      >
        <RegularNavigation
          title="Choose a game"
          subtitle="Pick one game to start a private room."
          leading="close"
          closeLabel="Close game selection"
          onBack={onDismiss}
          ariaLabel="Private room game selection"
          className="prototypePrivateRoomNavigation"
        />

        <div
          className="prototypePrivateRoomGameGrid"
          role="group"
          aria-label="Available games"
        >
          {games.map((game) => {
            const selected = game.name === selectedName;
            return (
              <button
                key={game.name}
                type="button"
                className={[
                  "prototypePrivateRoomGame",
                  selected ? "prototypePrivateRoomGame--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={`Select ${game.name}`}
                aria-pressed={selected}
                onClick={() => setSelectedName(game.name)}
              >
                <span className="prototypePrivateRoomGameArtwork">
                  <Image
                    src={game.image}
                    alt=""
                    width={109}
                    height={150}
                    sizes="104px"
                  />
                  {selected ? (
                    <span
                      className="prototypePrivateRoomGameCheck"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        <footer className="prototypePrivateRoomFooter">
          <button
            type="button"
            className="kitButton kitButton--height48 kitButton--primary"
            disabled={!selectedGame}
            onClick={() => {
              if (!selectedGame) return;
              onCreateRoom(selectedGame);
              onDismiss();
            }}
          >
            Start private room
          </button>
        </footer>
        <div className="prototypePrivateRoomHomeArea" aria-hidden="true">
          <span className="bottomNavigationHomeIndicator" />
        </div>
      </section>
    </div>
  );
}
