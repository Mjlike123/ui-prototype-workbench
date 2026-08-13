import Image from "next/image";
import type { ReactNode } from "react";
import {
  type EmptyStateIllustration,
  resolveEmptyStateIllustrationSrc,
} from "./empty-state-illustrations";

export type { EmptyStateIllustration };
export {
  DEFAULT_EMPTY_STATE_ILLUSTRATION,
  EMPTY_STATE_ILLUSTRATIONS,
} from "./empty-state-illustrations";

export type EmptyStateProps = {
  description: string;
  illustration?: EmptyStateIllustration;
  illustrationSrc?: string;
  illustrationNode?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  "aria-label"?: string;
};

export function EmptyState({
  description,
  illustration,
  illustrationSrc,
  illustrationNode,
  actionLabel,
  onAction,
  className = "",
  "aria-label": ariaLabel,
}: EmptyStateProps) {
  const hasAction = Boolean(actionLabel && onAction);
  const resolvedIllustrationSrc = resolveEmptyStateIllustrationSrc(
    illustration,
    illustrationSrc,
  );

  return (
    <section
      className={`emptyStateKit${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
    >
      <div className="emptyStateKitContent">
        {illustrationNode ?? (
          <Image
            className="emptyStateKitIllustration"
            src={resolvedIllustrationSrc}
            alt=""
            width={160}
            height={160}
            unoptimized
            aria-hidden="true"
          />
        )}
        <p className="emptyStateKitDescription">{description}</p>
      </div>
      {hasAction ? (
        <button
          type="button"
          className="kitButton kitButton--height48 kitButton--primary emptyStateKitAction"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
