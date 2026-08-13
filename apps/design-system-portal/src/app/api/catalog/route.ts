import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";

export async function GET() {
  const catalog = await getCatalog();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    principles: catalog.principles,
    components: catalog.components,
    foundations: catalog.foundations,
    interactions: catalog.interactions,
    platformMappings: catalog.platformMappings,
    auditRegistries: catalog.auditRegistries,
  });
}
