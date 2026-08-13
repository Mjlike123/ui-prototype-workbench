import type {
  ComponentCoverage,
  LifecycleStatus,
  Platform,
} from "@toptop/design-system-contract";

const labels: Record<LifecycleStatus, string> = {
  stable: "稳定",
  review: "评审中",
  draft: "草稿",
  deprecated: "已废弃",
};

export function StatusBadge({
  status = "draft",
}: {
  status?: LifecycleStatus;
}) {
  const className = {
    stable: "statusStable",
    review: "statusReview",
    draft: "statusDraft",
    deprecated: "statusDeprecated",
  }[status];
  return (
    <span className={`statusBadge ${className}`}>{labels[status]}</span>
  );
}

export function PlatformBadges({ platforms }: { platforms: Platform[] }) {
  return (
    <span className="platformList">
      {platforms.map((platform) => (
        <span key={platform} className="platformBadge">
          {platform === "h5" ? "Web" : platform}
        </span>
      ))}
    </span>
  );
}

export function CoveragePill({
  ready,
  children,
}: {
  ready: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`coveragePill ${
        ready ? "coverageReady" : "coveragePending"
      }`}
    >
      {ready ? "●" : "○"} {children}
    </span>
  );
}

export function CoverageSummary({
  coverage,
}: {
  coverage: ComponentCoverage;
}) {
  return (
    <>
      <CoveragePill ready={coverage.documentation}>文档</CoveragePill>
      <CoveragePill ready={coverage.reactPreview}>React</CoveragePill>
      <CoveragePill ready={coverage.iosAudit}>iOS 验收</CoveragePill>
    </>
  );
}
