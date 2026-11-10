import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { StudioProjectGallery } from "@/components/studio/studio-project-gallery";
import { getPrototypePreviewBreadcrumb } from "@/lib/prototype-preview-nav";
import { STUDIO_PROJECTS } from "@/lib/studio-project-catalog";
import { readStudioProjectState } from "@/lib/studio-project-store";

export const metadata: Metadata = {
  title: "原型创作 · 原型预览",
  description: "以项目卡片浏览并打开 TopTop Studio 交互原型。",
};

export const dynamic = "force-dynamic";

export default async function CanvasStudioPage() {
  const state = await readStudioProjectState();
  const projects = STUDIO_PROJECTS.filter((project) =>
    state.activeProjectIds.includes(project.id),
  );

  return (
    <>
      <header className="pageHeader">
        <div>
          <Breadcrumb items={getPrototypePreviewBreadcrumb("原型创作")} />
          <p className="eyebrow">PROTOTYPE STUDIO</p>
          <h1 className="pageTitle">原型创作</h1>
          <p className="pageDescription">
            以项目为单位查看交互方案。点击封面进入项目，继续验证页面、状态与流程。
          </p>
        </div>
      </header>
      <StudioProjectGallery initialProjects={projects} />
    </>
  );
}
