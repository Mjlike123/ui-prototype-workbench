export type AuditProfileSummary = {
  id: string;
  version: string;
  title: string;
  status?: string;
  platforms?: string[];
  ruleCount?: number;
  previewKey?: string;
};

export const auditServiceUrl =
  process.env.AUDIT_SERVICE_URL ?? "http://127.0.0.1:4317";

export async function getAuditServiceStatus(): Promise<{
  online: boolean;
  profiles: AuditProfileSummary[];
}> {
  try {
    const response = await fetch(`${auditServiceUrl}/api/audit/profiles`, {
      cache: "no-store",
      signal: AbortSignal.timeout(1200),
    });
    if (!response.ok) {
      return { online: false, profiles: [] };
    }
    return {
      online: true,
      profiles: (await response.json()) as AuditProfileSummary[],
    };
  } catch {
    return { online: false, profiles: [] };
  }
}
