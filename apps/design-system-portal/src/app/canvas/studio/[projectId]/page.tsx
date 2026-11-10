import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { StudioProjectWorkspace } from "@/components/studio/studio-project-workspace";
import { getPrototypePreviewBreadcrumb } from "@/lib/prototype-preview-nav";
import { getStudioProject } from "@/lib/studio-project-catalog";
import { readStudioProjectState } from "@/lib/studio-project-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;
  const project = getStudioProject(projectId);
  return {
    title: project ? `${project.title} · 原型创作` : "项目不存在 · 原型创作",
    description: project?.description,
  };
}

export default async function StudioProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = getStudioProject(projectId);
  const state = await readStudioProjectState();

  if (!project || !state.activeProjectIds.includes(project.id)) {
    notFound();
  }

  return (
    <>
      <header className="pageHeader studioProjectDetailHeader">
        <div>
          <Breadcrumb
            items={[
              ...getPrototypePreviewBreadcrumb("原型创作"),
              { label: project.title },
            ]}
          />
          <p className="eyebrow">STUDIO PROJECT</p>
          <h1 className="pageTitle">{project.title}</h1>
        </div>
      </header>
      <StudioProjectWorkspace project={project} />
    </>
  );
}
