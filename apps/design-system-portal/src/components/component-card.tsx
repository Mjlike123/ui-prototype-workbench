import Link from "next/link";
import type { ComponentSpec } from "@toptop/design-system-contract";
import { getComponentCoverage } from "@/lib/catalog";
import { ComponentPreview } from "./component-preview";
import {
  CoverageSummary,
  PlatformBadges,
  StatusBadge,
} from "./spec-badges";

export async function ComponentCard({
  component,
}: {
  component: ComponentSpec;
}) {
  const coverage = await getComponentCoverage(component);

  return (
    <Link href={`/components/${component.id}`} className="componentCard">
      <div className="componentPreviewMini">
        <ComponentPreview component={component} compact />
      </div>
      <div className="componentCardBody">
        <div className="cardTopline">
          <h3 className="cardTitle">{component.title}</h3>
          <StatusBadge status={component.status} />
        </div>
        <p className="cardDescription">{component.description}</p>
        <div className="tagList">
          {(component.tags ?? []).slice(0, 3).map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className="cardMeta">
          <PlatformBadges platforms={component.platforms} />
          <span>v{component.version}</span>
        </div>
        <div className="cardMeta">
          <CoverageSummary coverage={coverage} />
        </div>
      </div>
    </Link>
  );
}
