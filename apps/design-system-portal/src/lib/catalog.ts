import { cache } from "react";
import {
  loadContentDocument,
  loadPortalCatalog,
  type ComponentCoverage,
  type ComponentSpec,
} from "@toptop/design-system-contract";

export const getCatalog = cache(loadPortalCatalog);

export async function getComponent(id: string) {
  const catalog = await getCatalog();
  return catalog.components.find((component) => component.id === id);
}

export async function getInteraction(id: string) {
  const catalog = await getCatalog();
  return catalog.interactions.find((interaction) => interaction.id === id);
}

export async function getComponentContent(id: string) {
  return loadContentDocument("components", id);
}

export async function getInteractionContent(id: string) {
  return loadContentDocument("interactions", id);
}

export async function getFoundationContent(id: string) {
  return loadContentDocument("foundations", id);
}

export async function getComponentCoverage(
  component: ComponentSpec,
): Promise<ComponentCoverage> {
  const executableAuditRoles = ["container", "tabItem", "label"] as const;
  const supportsExecutableAudit = executableAuditRoles.every((role) =>
    component.roles.includes(role),
  );

  return {
    documentation: Boolean(await getComponentContent(component.id)),
    reactPreview: Boolean(component.previewKey),
    iosAudit:
      component.platforms.includes("ios") &&
      component.rules.length > 0 &&
      supportsExecutableAudit,
    platformCount: component.platforms.length,
  };
}

export function statusLabel(status: ComponentSpec["status"]) {
  switch (status) {
    case "stable":
      return "稳定";
    case "review":
      return "评审中";
    case "deprecated":
      return "已废弃";
    default:
      return "草稿";
  }
}
