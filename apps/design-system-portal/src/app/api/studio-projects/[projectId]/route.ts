import { NextResponse } from "next/server";
import { isStudioProjectId } from "@/lib/studio-project-catalog";
import { removeStudioProject } from "@/lib/studio-project-store";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  if (!isStudioProjectId(projectId)) {
    return NextResponse.json(
      { error: "项目不在 Studio 删除白名单中。" },
      { status: 400 },
    );
  }

  try {
    const result = await removeStudioProject(projectId);
    if (!result.removed) {
      return NextResponse.json(
        { error: "项目不存在或已被删除。" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, projectId });
  } catch {
    return NextResponse.json(
      { error: "无法更新 Studio 项目记录，请检查文件写入权限。" },
      { status: 500 },
    );
  }
}
