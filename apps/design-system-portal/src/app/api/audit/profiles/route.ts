import { NextResponse } from "next/server";
import { getAuditServiceStatus } from "@/lib/audit-service";
import { getCatalog } from "@/lib/catalog";

export async function GET() {
  const service = await getAuditServiceStatus();
  if (service.online) {
    return NextResponse.json({
      source: "audit-service",
      profiles: service.profiles,
    });
  }

  const catalog = await getCatalog();
  return NextResponse.json({
    source: "shared-contract",
    profiles: catalog.components.map((component) => ({
      id: component.id,
      version: component.version,
      title: component.title,
      status: component.status,
      platforms: component.platforms,
      ruleCount: component.rules.length,
      previewKey: component.previewKey,
    })),
  });
}
