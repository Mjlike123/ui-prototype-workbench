"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SelectorButton } from "@/components/kit/selector-button";

export type CenterDialogActionTone = "primary" | "neutral" | "destructive";

export type CenterDialogAction = {
  id: string;
  label: string;
  tone?: CenterDialogActionTone;
  disabled?: boolean;
  onPress?: () => void;
};

export type CenterDialogReminder = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export type CenterDialogActionLayout = "single" | "horizontal" | "vertical";

export type CenterDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  illustration?: ReactNode;
  reminder?: CenterDialogReminder;
  actions: CenterDialogAction[];
  actionLayout?: CenterDialogActionLayout;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  "aria-label"?: string;
};

const EXIT_MS = 320;

function resolveActionLayout(
  actions: CenterDialogAction[],
  actionLayout?: CenterDialogActionLayout,
): CenterDialogActionLayout {
  if (actionLayout) return actionLayout;
  if (actions.length <= 1) return "single";
  return "horizontal";
}

function actionButtonClass(tone: CenterDialogActionTone = "primary") {
  const base = "kitButton kitButton--height40";
  if (tone === "neutral") return `${base} kitButton--neutral`;
  if (tone === "destructive") {
    return `${base} kitButton--neutral kitCenterDialogAction--destructive`;
  }
  return `${base} kitButton--primary`;
}

export function CenterDialog({
  open,
  title,
  description,
  illustration,
  reminder,
  actions,
  actionLayout,
  dismissible = false,
  onDismiss,
  className,
  "aria-label": ariaLabel,
}: CenterDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState<"enter" | "exit">("enter");

  const layout = resolveActionLayout(actions, actionLayout);

  useEffect(() => {
    if (open) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      setMounted(true);
      setPhase("enter");
      return;
    }

    if (!mounted) return;

    setPhase("exit");
    const timer = window.setTimeout(() => {
      setMounted(false);
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
    }, EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [mounted, open]);

  useEffect(() => {
    if (!mounted || phase === "exit") return;

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        onDismiss?.();
        return;
      }

      if (event.key !== "Tab" || !focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dismissible, mounted, onDismiss, phase]);

  if (!mounted) return null;

  const handleAction = (action: CenterDialogAction) => {
    if (action.disabled) return;
    action.onPress?.();
  };

  return (
    <div
      className={[
        "kitCenterDialogOverlay",
        phase === "exit" ? "kitCenterDialogOverlay--exit" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="presentation"
    >
      {dismissible ? (
        <button
          type="button"
          className={[
            "kitCenterDialogBackdrop",
            phase === "exit" ? "kitCenterDialogBackdrop--exit" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label="关闭"
          onClick={onDismiss}
        />
      ) : (
        <div
          className={[
            "kitCenterDialogBackdrop",
            "kitCenterDialogBackdrop--static",
            phase === "exit" ? "kitCenterDialogBackdrop--exit" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-label={ariaLabel}
        className={[
          "kitCenterDialog",
          phase === "exit" ? "kitCenterDialog--exit" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="kitCenterDialogTextRegion">
          <h2 id={titleId} className="kitCenterDialogTitle">{title}</h2>
          {illustration ? (
            <div className="kitCenterDialogIllustration">{illustration}</div>
          ) : null}
          {description ? (
            <p id={descriptionId} className="kitCenterDialogDescription">
              {description}
            </p>
          ) : null}
        </div>

        <div className="kitCenterDialogActionRegion">
          {reminder ? (
            <div className="kitCenterDialogReminder">
              <SelectorButton
                selected={reminder.checked}
                onChange={reminder.onChange}
                aria-label={reminder.label}
              />
              <span>{reminder.label}</span>
            </div>
          ) : null}

          <div
            className={[
              "kitCenterDialogActions",
              layout === "horizontal"
                ? "kitCenterDialogActions--horizontal"
                : "",
              layout === "vertical" ? "kitCenterDialogActions--vertical" : "",
              layout === "single" ? "kitCenterDialogActions--single" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                className={actionButtonClass(action.tone)}
                disabled={action.disabled}
                onClick={() => handleAction(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
