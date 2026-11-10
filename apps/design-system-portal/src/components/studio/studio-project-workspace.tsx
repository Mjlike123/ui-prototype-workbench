"use client";

import Link from "next/link";
import { useState } from "react";
import { StudioFeedComposePage } from "@/components/studio/studio-feed-compose-page";
import { StudioImCustomEmojiPage } from "@/components/studio/studio-im-custom-emoji-page";
import { StudioLiveRoomPage } from "@/components/studio/studio-live-room-page";
import { StudioMessageConversationPinPage } from "@/components/studio/studio-message-conversation-pin-page";
import { StudioMomentLikedMentionPage } from "@/components/studio/studio-moment-liked-mention-page";
import { StudioMomentPublishDetailPage } from "@/components/studio/studio-moment-publish-detail-page";
import { StudioOfferCenterPage } from "@/components/studio/studio-offer-center-page";
import { StudioReportReasonPage } from "@/components/studio/studio-report-reason-page";
import { StudioSearchFlowPage } from "@/components/studio/studio-search-flow-page";
import { StudioTopicDiscoveryPage } from "@/components/studio/studio-topic-discovery-page";
import { StudioSpinBottlePage } from "@/components/studio/studio-spin-bottle-page";
import { StudioVoiceRoomStatusPage } from "@/components/studio/studio-voice-room-status-page";
import { StudioCharacterImpressionSharePage } from "@/components/studio/studio-character-impression-share-page";
import { StudioRecipeCommunityRedesignPage } from "@/components/studio/studio-recipe-community-redesign-page";
import { StudioAppLoginFlowPage } from "@/components/studio/studio-app-login-flow-page";
import { StudioSocialSplashPage } from "@/components/studio/studio-social-splash-page";
import type {
  StudioProject,
  StudioProjectId,
} from "@/lib/studio-project-catalog";
import {
  DEFAULT_PAGE_CANVAS_PRESET_ID,
  getPageCanvasPreset,
  PAGE_CANVAS_SIZE_PRESETS,
} from "@/lib/page-canvas-size";

const initialPreset = getPageCanvasPreset(DEFAULT_PAGE_CANVAS_PRESET_ID)!;

export function StudioProjectWorkspace({
  project,
}: {
  project: StudioProject;
}) {
  const [width, setWidth] = useState(initialPreset.width);
  const [height, setHeight] = useState(initialPreset.height);
  const [theme, setTheme] = useState<"light" | "dark">(
    project.id === "recipe-community-redesign" ? "dark" : "light",
  );
  const [status, setStatus] = useState<string | null>(null);

  return (
    <div className="studioProjectWorkspace">
      <section
        className="studioProjectPreview"
        aria-labelledby="studio-preview-title"
      >
        <header className="studioProjectWorkspaceToolbar">
          <div>
            <p className="studioProjectSectionEyebrow">INTERACTIVE PROTOTYPE</p>
            <strong id="studio-preview-title">交互原型</strong>
          </div>
          <div className="studioProjectWorkspaceControls">
            <label>
              <span>设备</span>
              <select
                aria-label="切换设备尺寸"
                defaultValue={DEFAULT_PAGE_CANVAS_PRESET_ID}
                onChange={(event) => {
                  const preset = getPageCanvasPreset(event.target.value);
                  if (!preset) return;
                  setWidth(preset.width);
                  setHeight(preset.height);
                }}
              >
                {PAGE_CANVAS_SIZE_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>
            {project.id !== "social-splash-seeded" ? (
              <label>
                <span>主题</span>
                <select
                  aria-label="切换原型主题"
                  value={theme}
                  onChange={(event) =>
                    setTheme(event.target.value === "dark" ? "dark" : "light")
                  }
                >
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                </select>
              </label>
            ) : null}
          </div>
        </header>

        {status ? (
          <p className="studioProjectNotice" role="status">
            {status}
          </p>
        ) : null}

        <main
          className={[
            "studioProjectStage",
            project.id === "recipe-community-redesign"
              ? "studioProjectStage--recipeCommunityBlack"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={`${project.title}交互预览`}
        >
          <StudioProjectRenderer
            projectId={project.id}
            width={width}
            height={height}
            theme={theme}
            onStatus={setStatus}
          />
        </main>
      </section>

      <aside
        className="studioProjectInfo"
        aria-labelledby="studio-project-info-title"
      >
        <div className="studioProjectInfoIntro">
          <Link href="/canvas/studio" className="studioProjectBackLink">
            ← 返回原型创作
          </Link>
          <p className="studioProjectSectionEyebrow">PROJECT NOTES</p>
          <h2 id="studio-project-info-title">项目说明</h2>
          <p>{project.description}</p>
          {project.version ? (
            <span className="studioProjectVersion">{project.version}</span>
          ) : null}
        </div>

        <section className="studioProjectInfoSection">
          <h3>如何体验</h3>
          <p>
            直接操作左侧原型，完成点击、输入、切换与反馈流程。可通过顶部控件检查不同设备尺寸和明暗主题。
          </p>
        </section>

        <section className="studioProjectInfoSection">
          <h3>复用 Kit</h3>
          <ul className="studioProjectTagList" aria-label="复用的 Kit 组件">
            {project.kit.map((componentId) => (
              <li key={componentId}>{componentId}</li>
            ))}
          </ul>
        </section>

        <section className="studioProjectInfoSection">
          <h3>原型模块</h3>
          <ul className="studioProjectModuleList">
            {project.prototypeModules.map((moduleName) => (
              <li key={moduleName}>
                <code>{moduleName}</code>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}

function StudioProjectRenderer({
  projectId,
  width,
  height,
  theme,
  onStatus,
}: {
  projectId: StudioProjectId;
  width: number;
  height: number;
  theme: "light" | "dark";
  onStatus: (message: string) => void;
}) {
  const onBack = () => onStatus("原型内返回操作已触发");

  if (projectId === "app-login-flow") {
    return (
      <StudioAppLoginFlowPage
        width={width}
        height={height}
        theme={theme}
      />
    );
  }
  if (projectId === "social-splash-seeded") {
    return (
      <StudioSocialSplashPage width={width} height={height} />
    );
  }
  if (projectId === "character-impression-share") {
    return (
      <StudioCharacterImpressionSharePage
        width={width}
        height={height}
        theme={theme}
        onBack={onBack}
      />
    );
  }
  if (projectId === "report-reason-optimization") {
    return (
      <StudioReportReasonPage
        width={width}
        height={height}
        theme={theme}
        onBack={onBack}
      />
    );
  }
  if (projectId === "offer-center-optimization") {
    return (
      <StudioOfferCenterPage
        width={width}
        height={height}
        theme={theme}
        onBack={onBack}
      />
    );
  }
  if (projectId === "message-conversation-pin") {
    return (
      <StudioMessageConversationPinPage
        width={width}
        height={height}
        theme={theme}
      />
    );
  }
  if (projectId === "feed-compose") {
    return (
      <StudioFeedComposePage
        width={width}
        height={height}
        theme={theme}
        onBack={onBack}
        onPublished={() => onStatus("动态已发布")}
      />
    );
  }
  if (projectId === "im-custom-emoji") {
    return (
      <StudioImCustomEmojiPage
        width={width}
        height={height}
        theme={theme}
        onBack={onBack}
      />
    );
  }
  if (projectId === "live-room") {
    return (
      <StudioLiveRoomPage
        width={width}
        height={height}
        theme={theme}
        onBack={onBack}
      />
    );
  }
  if (projectId === "spin-bottle") {
    return (
      <StudioSpinBottlePage
        width={width}
        height={height}
        theme={theme}
        onBack={onBack}
      />
    );
  }
  if (projectId === "voice-room-status") {
    return (
      <StudioVoiceRoomStatusPage
        width={width}
        height={height}
        theme={theme}
        onBack={onBack}
      />
    );
  }
  if (projectId === "moment-liked-mention") {
    return (
      <StudioMomentLikedMentionPage
        width={width}
        height={height}
        theme={theme}
      />
    );
  }
  if (projectId === "moment-publish-detail") {
    return (
      <StudioMomentPublishDetailPage
        width={width}
        height={height}
        theme={theme}
        onBack={onBack}
      />
    );
  }
  if (projectId === "topic-discovery") {
    return (
      <StudioTopicDiscoveryPage
        width={width}
        height={height}
        theme={theme}
        onBack={onBack}
      />
    );
  }
  if (projectId === "recipe-community-redesign") {
    return (
      <StudioRecipeCommunityRedesignPage
        width={width}
        height={height}
        theme={theme}
        onBack={onBack}
      />
    );
  }
  return (
    <StudioSearchFlowPage
      width={width}
      height={height}
      theme={theme}
      onBack={onBack}
    />
  );
}
