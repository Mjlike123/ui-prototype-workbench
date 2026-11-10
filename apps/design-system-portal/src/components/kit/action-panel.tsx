"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { SystemIcon } from "@/components/kit/system-icon";
import { Switch } from "@/components/kit/switch";

export type ActionPanelItemTone = "default" | "emphasis" | "destructive";

export type ActionPanelItem = {
  id: string;
  label: string;
  tone?: ActionPanelItemTone;
  disabled?: boolean;
  onPress?: () => void;
};

export type ActionPanelHeader = {
  title: string;
  backLabel?: string;
  confirmLabel?: string;
  onBack?: () => void;
  onConfirm?: () => void;
};

export type ActionPanelFooterSwitch = {
  title: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  switchLabel?: string;
};

export type ActionPanelProps = {
  description?: string;
  header?: ActionPanelHeader;
  actions: ActionPanelItem[];
  cancelLabel?: string;
  onCancel?: () => void;
  footerSwitch?: ActionPanelFooterSwitch;
  showHomeIndicator?: boolean;
  className?: string;
  "aria-label"?: string;
  onAction?: (item: ActionPanelItem) => void;
  /** When false, omit dialog role so a parent sheet can provide semantics. */
  dialogRole?: boolean;
};

export type ActionPanelSheetProps = ActionPanelProps & {
  open: boolean;
  dismissible?: boolean;
  closeOnAction?: boolean;
  onDismiss?: () => void;
};

const ENTER_MS = 250;
const EXIT_MS = 200;

export function ActionPanel({
  description,
  header,
  actions,
  cancelLabel = "取消",
  onCancel,
  footerSwitch,
  showHomeIndicator = true,
  className,
  "aria-label": ariaLabel,
  onAction,
  dialogRole = true,
}: ActionPanelProps) {
  const accessibleTitle =
    ariaLabel ?? header?.title ?? description ?? "动作面板";
  const showCancel = Boolean(cancelLabel && onCancel);
  const showFooter = showCancel || Boolean(footerSwitch);

  const handleAction = (item: ActionPanelItem) => {
    if (item.disabled) return;
    onAction?.(item);
    item.onPress?.();
  };

  return (
    <section
      className={["kitActionPanel", className].filter(Boolean).join(" ")}
      role={dialogRole ? "dialog" : undefined}
      aria-label={dialogRole ? accessibleTitle : undefined}
    >
      {header ? (
        <header className="kitActionPanelToolbar" aria-label={header.title}>
          <button
            type="button"
            className="kitActionPanelToolbarBack"
            aria-label={header.backLabel ?? "返回"}
            onClick={header.onBack}
          >
            <SystemIcon name="back" size={24} />
          </button>
          <p className="kitActionPanelToolbarTitle">{header.title}</p>
          {header.confirmLabel ? (
            <button
              type="button"
              className="kitActionPanelToolbarConfirm"
              onClick={header.onConfirm}
            >
              {header.confirmLabel}
            </button>
          ) : (
            <span className="kitActionPanelToolbarSpacer" aria-hidden="true" />
          )}
        </header>
      ) : description ? (
        <p className="kitActionPanelDescription">{description}</p>
      ) : null}

      <div className="kitActionPanelList" role="menu" aria-label="操作列表">
        {actions.length === 0 ? (
          <p className="kitActionPanelEmpty">暂无可用操作</p>
        ) : (
          actions.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={[
                "kitActionPanelItem",
                item.tone ? `kitActionPanelItem--${item.tone}` : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={item.disabled}
              onClick={() => handleAction(item)}
            >
              {item.label}
            </button>
          ))
        )}
      </div>

      {showFooter ? (
        <div className="kitActionPanelFooter">
          {showCancel ? (
            <>
              <div className="kitActionPanelSectionGap" aria-hidden="true" />
              <button
                type="button"
                className="kitActionPanelCancel"
                onClick={onCancel}
              >
                {cancelLabel}
              </button>
            </>
          ) : null}
          {footerSwitch ? (
            <div className="kitActionPanelSwitchRow">
              <div className="kitActionPanelSwitchCopy">
                <strong>{footerSwitch.title}</strong>
                {footerSwitch.description ? (
                  <span>{footerSwitch.description}</span>
                ) : null}
              </div>
              <Switch
                checked={footerSwitch.checked}
                disabled={footerSwitch.disabled}
                onChange={footerSwitch.onChange}
                aria-label={
                  footerSwitch.switchLabel ?? footerSwitch.title
                }
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {showHomeIndicator ? (
        <div className="kitActionPanelHomeIndicator" aria-hidden="true">
          <span />
        </div>
      ) : null}
    </section>
  );
}

export function ActionPanelSheet({
  open,
  dismissible = true,
  closeOnAction = true,
  onDismiss,
  dialogRole,
  ...panelProps
}: ActionPanelSheetProps) {
  void dialogRole;
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState<"enter" | "exit">("enter");

  const accessibleTitle =
    panelProps["aria-label"] ??
    panelProps.header?.title ??
    panelProps.description ??
    "动作面板";

  useEffect(() => {
    if (open) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      const frame = window.requestAnimationFrame(() => {
        setMounted(true);
        setPhase("enter");
      });
      return () => window.cancelAnimationFrame(frame);
    }

    if (!mounted) return;

    let timer: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      setPhase("exit");
      timer = window.setTimeout(() => {
        setMounted(false);
        restoreFocusRef.current?.focus();
        restoreFocusRef.current = null;
      }, EXIT_MS);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [mounted, open]);

  useEffect(() => {
    if (!mounted || phase === "exit") return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusFirst = () => {
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      focusable[0]?.focus({ preventScroll: true });
    };

    let focused = false;
    const focusFirstOnce = () => {
      if (focused) return;
      focused = true;
      focusFirst();
    };

    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target !== panel) return;
      focusFirstOnce();
    };

    panel.addEventListener("animationend", onAnimationEnd);
    const focusFallback = window.setTimeout(focusFirstOnce, ENTER_MS + 32);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        onDismiss?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      panel.removeEventListener("animationend", onAnimationEnd);
      window.clearTimeout(focusFallback);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [dismissible, mounted, onDismiss, phase]);

  if (!mounted) return null;

  const sheetActions = panelProps.actions.map((item) => ({
    ...item,
    onPress: () => {
      item.onPress?.();
      if (closeOnAction) {
        onDismiss?.();
      }
    },
  }));

  return (
    <div
      className={[
        "kitActionPanelOverlay",
        phase === "exit" ? "kitActionPanelOverlay--exit" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="presentation"
    >
      {dismissible ? (
        <button
          type="button"
          className={[
            "kitActionPanelBackdrop",
            phase === "exit" ? "kitActionPanelBackdrop--exit" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label="关闭"
          onClick={onDismiss}
        />
      ) : (
        <div
          className={[
            "kitActionPanelBackdrop",
            "kitActionPanelBackdrop--static",
            phase === "exit" ? "kitActionPanelBackdrop--exit" : "",
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
        aria-label={accessibleTitle}
        className={[
          "kitActionPanelDock",
          phase === "exit" ? "kitActionPanelDock--exit" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ActionPanel
          {...panelProps}
          actions={sheetActions}
          dialogRole={false}
        />
      </div>
    </div>
  );
}
