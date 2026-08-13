type IconName =
  | "home"
  | "principle"
  | "guide"
  | "foundation"
  | "component"
  | "interaction"
  | "canvas"
  | "audit"
  | "governance"
  | "search"
  | "external"
  | "check"
  | "clock";

export function Icon({
  name,
  size = 18,
}: {
  name: IconName;
  size?: number;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <path d="M3 10.8 12 3l9 7.8V21h-6v-6H9v6H3Z" />,
    principle: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9Z" />
      </>
    ),
    guide: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z" />
      </>
    ),
    foundation: (
      <>
        <circle cx="8" cy="8" r="4" />
        <circle cx="16" cy="8" r="4" />
        <circle cx="12" cy="16" r="4" />
      </>
    ),
    component: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    interaction: (
      <>
        <path d="m5 4 14 7-6 2-2 6Z" />
        <path d="m14 14 4 4" />
      </>
    ),
    canvas: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 12h8M8 8h5" />
      </>
    ),
    audit: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 5 5M8 11l2 2 4-5" />
      </>
    ),
    governance: (
      <>
        <path d="M12 3 4 7v5c0 5 3.4 8 8 9 4.6-1 8-4 8-9V7Z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 5 5" />
      </>
    ),
    external: <path d="M14 4h6v6M20 4l-9 9M18 13v7H4V6h7" />,
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
