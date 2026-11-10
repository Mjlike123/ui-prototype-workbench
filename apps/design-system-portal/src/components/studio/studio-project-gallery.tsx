"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CenterDialog } from "@/components/kit/center-dialog";
import type { StudioProject } from "@/lib/studio-project-catalog";
import {
  clearLegacyPageCanvasHistory,
  clearStudioProjectUserData,
} from "@/lib/studio-project-user-data";

export function StudioProjectGallery({
  initialProjects,
}: {
  initialProjects: StudioProject[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [pendingProject, setPendingProject] = useState<StudioProject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    clearLegacyPageCanvasHistory();
  }, []);

  async function confirmDelete() {
    if (!pendingProject) return;
    setDeleting(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/studio-projects/${pendingProject.id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "删除项目失败");
      }
      clearStudioProjectUserData(pendingProject.id);
      setProjects((current) =>
        current.filter((project) => project.id !== pendingProject.id),
      );
      setNotice(`已删除「${pendingProject.title}」的原型创作内容。`);
      setPendingProject(null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "删除项目失败");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {notice ? (
        <p className="studioProjectNotice" role="status">
          {notice}
        </p>
      ) : null}

      {projects.length > 0 ? (
        <ul className="studioProjectGrid" aria-label="原型创作项目">
          {projects.map((project) => (
            <li key={project.id} className="studioProjectCard">
              <Link
                href={`/canvas/studio/${project.id}`}
                className="studioProjectCardLink"
                aria-label={`打开项目：${project.title}`}
              >
                <span className="studioProjectCover">
                  <Image
                    src={project.coverSrc}
                    alt={`${project.title} 默认场景`}
                    fill
                    sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </span>
                <span className="studioProjectCardBody">
                  <span className="studioProjectCardHeading">
                    <strong>{project.title}</strong>
                    {project.version ? <small>{project.version}</small> : null}
                  </span>
                  <span className="studioProjectDescription">
                    {project.description}
                  </span>
                  <span className="studioProjectMeta">
                    {project.kit.length} 个 Kit · {project.prototypeModules.length} 个原型模块
                  </span>
                </span>
              </Link>
              <button
                type="button"
                className="studioProjectDeleteButton"
                aria-label={`删除项目：${project.title}`}
                onClick={() => {
                  setNotice(null);
                  setPendingProject(project);
                }}
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="studioProjectEmpty">
          <strong>暂无原型创作项目</strong>
          <p>新的 Studio 项目实现并登记后会显示在这里。</p>
        </div>
      )}

      <CenterDialog
        open={Boolean(pendingProject)}
        title="删除这个项目？"
        description={
          pendingProject
            ? `将从原型创作中删除「${pendingProject.title}」及其 Studio 专属数据。Kit、Core 与共享组件不会被删除。`
            : undefined
        }
        dismissible={!deleting}
        onDismiss={() => setPendingProject(null)}
        actions={[
          {
            id: "cancel",
            label: "取消",
            tone: "neutral",
            disabled: deleting,
            onPress: () => setPendingProject(null),
          },
          {
            id: "delete",
            label: deleting ? "删除中…" : "确认删除",
            tone: "destructive",
            disabled: deleting,
            onPress: () => void confirmDelete(),
          },
        ]}
      />
    </>
  );
}
