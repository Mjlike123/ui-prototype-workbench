"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ActionPanelSheet } from "@/components/kit/action-panel";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { CenterDialog } from "@/components/kit/center-dialog";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { PillSecondaryTab } from "@/components/kit/pill-secondary-tab";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { SystemIcon } from "@/components/kit/system-icon";
import { Toast } from "@/components/kit/toast";

type DemoScenario =
  | "generate"
  | "library"
  | "detail"
  | "share-landing"
  | "share-snapchat"
  | "error";

type GenerateStep = "form" | "first-free" | "generating" | "view";

type LibraryTab = "mine" | "hot";

type GenerationCardState = "add" | "generating" | "failed" | "ready";

const DEMO_SCENARIOS: readonly { id: DemoScenario; label: string }[] = [
  { id: "generate", label: "生成" },
  { id: "library", label: "形象库" },
  { id: "detail", label: "详情" },
  { id: "share-landing", label: "分享·抖音" },
  { id: "share-snapchat", label: "分享·Snap" },
  { id: "error", label: "异常" },
];

const INSTRUCTION_TEMPLATES = [
  "Ghibli",
  "3D Pixel",
  "Minecraft",
  "LEGO",
  "Roblox",
] as const;

const SAMPLE_CODE = "P32HGD430T";
const IMPORT_CODE = "32HU22PXCC";

/** 透明底 3D 站姿形象，用于预览卡 / 详情 / 站外落地 */
const CHARACTER_HERO_3D = "/prototypes/studio/character-share-hero-3d.png";
const CHARACTER_PREVIEW = CHARACTER_HERO_3D;

const SHARE_LANDING_PROPS = {
  inviterName: "Andrew",
  inviterAvatar: "/prototypes/feed/andrew-avatar.png",
  characterCode: IMPORT_CODE,
  previewSrc: CHARACTER_PREVIEW,
} as const;

export function StudioCharacterImpressionSharePage({
  width = 375,
  height = 812,
  theme = "light",
  onBack,
}: {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack?: () => void;
}) {
  const [scenario, setScenario] = useState<DemoScenario>("generate");
  const [generateStep, setGenerateStep] = useState<GenerateStep>("form");
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("mine");
  const [hasUploadedImage, setHasUploadedImage] = useState(true);
  const [instruction, setInstruction] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    INSTRUCTION_TEMPLATES[0],
  );
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [firstCreationSeen, setFirstCreationSeen] = useState(false);
  const [privateOnly, setPrivateOnly] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [activeCardId, setActiveCardId] = useState("ready-1");
  const [toast, setToast] = useState<string>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const codeReady = codeInput.trim().length >= 8;

  const generationCards = useMemo(
    () => [
      { id: "add", state: "add" as GenerationCardState, label: "Add" },
      {
        id: "generating",
        state: "generating" as GenerationCardState,
        label: "Generating",
      },
      { id: "failed", state: "failed" as GenerationCardState, label: "Failed" },
      {
        id: "ready-1",
        state: "ready" as GenerationCardState,
        label: "ID:3123242",
        using: true,
      },
      {
        id: "ready-2",
        state: "ready" as GenerationCardState,
        label: "ID:3123242",
        using: false,
      },
    ],
    [],
  );

  const resetGenerateFlow = () => {
    setGenerateStep("form");
    setCodeModalOpen(false);
    setCodeInput("");
  };

  const startGenerate = () => {
    if (!hasUploadedImage) {
      setToast("请先上传人物图片");
      return;
    }
    if (!firstCreationSeen) {
      setGenerateStep("first-free");
      return;
    }
    setGenerateStep("generating");
    window.setTimeout(() => setGenerateStep("view"), 1400);
  };

  const confirmFirstCreation = () => {
    setFirstCreationSeen(true);
    setGenerateStep("generating");
    window.setTimeout(() => setGenerateStep("view"), 1400);
  };

  const applyCharacterCode = () => {
    if (!codeReady) return;
    setCodeModalOpen(false);
    setGenerateStep("view");
    setToast("已载入分享形象");
  };

  const useCharacter = () => {
    setToast("形象已设为当前使用");
  };

  const confirmDeleteCharacter = () => {
    setDeleteDialogOpen(false);
    setGenerateStep("form");
    setScenario("library");
    setToast("形象已删除");
  };

  const deviceClass =
    theme === "dark" && scenario !== "share-snapchat"
      ? "studioCharacterShareDevice studioCharacterShareDevice--dark"
      : "studioCharacterShareDevice";

  const statusBarAppearance =
    scenario === "share-landing"
      ? "light-content"
      : theme === "dark"
        ? "light-content"
        : "dark-content";

  return (
    <div
      className="studioCharacterShareShell"
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
    >
      <div
        className="studioCharacterShareControls"
        aria-label="Character share prototype scenarios"
      >
        <div role="tablist" aria-label="演示场景">
          {DEMO_SCENARIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={scenario === item.id}
              className={
                scenario === item.id
                  ? "studioCharacterShareControl studioCharacterShareControl--active"
                  : "studioCharacterShareControl"
              }
              onClick={() => {
                setScenario(item.id);
                if (item.id === "generate") resetGenerateFlow();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={deviceClass}
        style={{ height }}
        data-theme={theme}
        aria-label="Character impression share prototype"
      >
        <IosStatusBar appearance={statusBarAppearance} />

        {scenario === "generate" ? (
          <>
            {generateStep === "view" ? (
              <CharacterViewScreen
                code={codeInput.trim() || SAMPLE_CODE}
                privateOnly={privateOnly}
                onPrivateChange={setPrivateOnly}
                onBack={() => setGenerateStep("form")}
                onDelete={() => setDeleteDialogOpen(true)}
                onUse={useCharacter}
                onShare={() => setShareSheetOpen(true)}
                onCopyCode={() => setToast("形象码已复制")}
                previewSrc={CHARACTER_PREVIEW}
              />
            ) : (
              <>
            <RegularNavigation
              title="Generate Characters"
              onBack={onBack}
              trailing={
                <button
                  type="button"
                  className="regularNavigationActionButton studioCharacterShareCodeAction"
                  onClick={() => setCodeModalOpen(true)}
                >
                  Characters Code
                </button>
              }
              trailingKind="button"
            />
            <div className="pageCanvasContentShell studioCharacterShareScroll">
                  <section className="studioCharacterShareSection">
                    <h2>Image</h2>
                    {hasUploadedImage ? (
                      <div className="studioCharacterShareUploadPreview">
                        <img
                          src="/prototypes/feed/latifa-avatar.png"
                          alt=""
                          width={120}
                          height={160}
                        />
                        <button
                          type="button"
                          className="studioCharacterShareIconBtn"
                          aria-label="移除图片"
                          onClick={() => setHasUploadedImage(false)}
                        >
                          <SystemIcon name="close" size={20} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="studioCharacterShareUploadEmpty"
                        onClick={() => setHasUploadedImage(true)}
                      >
                        <SystemIcon name="add" size={24} />
                        <span>Upload an person image</span>
                        <small>
                          Upload a image of the person, otherwise the process
                          will fail.
                        </small>
                      </button>
                    )}
                  </section>

                  <section className="studioCharacterShareSection">
                    <div className="studioCharacterShareSectionHead">
                      <h2>Text Instruction</h2>
                      <span>{instruction.length}/400</span>
                    </div>
                    <textarea
                      className="studioCharacterShareTextarea"
                      value={instruction}
                      maxLength={400}
                      placeholder="Describe what you want to change"
                      aria-label="Text instruction"
                      onChange={(event) => setInstruction(event.target.value)}
                    />
                  </section>

                  <section className="studioCharacterShareSection">
                    <h2>Instruction Templates</h2>
                    <div
                      className="studioCharacterShareTemplateRow"
                      role="listbox"
                      aria-label="Instruction templates"
                    >
                      {INSTRUCTION_TEMPLATES.map((name) => (
                        <button
                          key={name}
                          type="button"
                          role="option"
                          aria-selected={selectedTemplate === name}
                          className={
                            selectedTemplate === name
                              ? "studioCharacterShareTemplate studioCharacterShareTemplate--active"
                              : "studioCharacterShareTemplate"
                          }
                          onClick={() => setSelectedTemplate(name)}
                        >
                          <span aria-hidden="true">{name.slice(0, 1)}</span>
                          <small>{name}</small>
                        </button>
                      ))}
                    </div>
                  </section>

                  {generateStep === "generating" ? (
                    <p className="studioCharacterShareStatus" role="status">
                      Generating…
                    </p>
                  ) : null}
            </div>

              <footer className="studioCharacterShareFooter">
                <button
                  type="button"
                  className="kitButton kitButton--height48 kitButton--primary studioCharacterShareGenerateBtn"
                  disabled={generateStep === "generating"}
                  onClick={startGenerate}
                >
                  Generate
                  <span className="studioCharacterShareCoin">19,999</span>
                </button>
              </footer>
              </>
            )}

            <CenterDialog
              open={generateStep === "first-free"}
              title="仅首次创建免费"
              description="仅首次创建免费，后续创建需要支付金币。确认创建吗？"
              illustration={
                <span className="studioCharacterShareMascot" aria-hidden="true">
                  🦭
                </span>
              }
              actions={[
                {
                  id: "confirm",
                  label: "确定",
                  onPress: confirmFirstCreation,
                },
                {
                  id: "cancel",
                  label: "取消",
                  tone: "neutral",
                  onPress: () => setGenerateStep("form"),
                },
              ]}
              dismissible
              onDismiss={() => setGenerateStep("form")}
            />

            {codeModalOpen ? (
              <CharacterCodeDialog
                value={codeInput}
                ready={codeReady}
                onChange={setCodeInput}
                onDismiss={() => setCodeModalOpen(false)}
                onConfirm={applyCharacterCode}
              />
            ) : null}
          </>
        ) : null}

        {scenario === "library" ? (
          <>
            <RegularNavigation
              title="All character"
              onBack={onBack}
              trailing={
                <button
                  type="button"
                  aria-label="搜索"
                  className="studioCharacterShareIconBtn"
                  onClick={() => setToast("搜索暂未接入")}
                >
                  <SystemIcon name="search" size={24} />
                </button>
              }
            />
            <div className="pageCanvasContentShell studioCharacterShareScroll">
              <PillSecondaryTab
                items={[
                  { key: "mine", label: "My character" },
                  { key: "hot", label: "Hot Character" },
                ]}
                value={libraryTab}
                onChange={(key) => setLibraryTab(key as LibraryTab)}
                ariaLabel="Character library tabs"
                className="studioCharacterShareLibraryTabs"
              />
              <h2 className="studioCharacterShareSubheading">My Generations</h2>
              <div className="studioCharacterShareCardGrid">
                {generationCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    className={
                      activeCardId === card.id
                        ? "studioCharacterShareCard studioCharacterShareCard--active"
                        : "studioCharacterShareCard"
                    }
                    onClick={() => {
                      setActiveCardId(card.id);
                      if (card.state === "ready") setScenario("detail");
                      if (card.state === "failed") setScenario("error");
                    }}
                  >
                    {card.state === "add" ? (
                      <>
                        <SystemIcon name="add" size={24} />
                        <span>Add</span>
                      </>
                    ) : null}
                    {card.state === "generating" ? (
                      <>
                        <span
                          className="studioCharacterShareSpinner"
                          aria-hidden="true"
                        />
                        <span>Generating</span>
                      </>
                    ) : null}
                    {card.state === "failed" ? (
                      <>
                        <SystemIcon name="close" size={24} />
                        <span>Failed</span>
                      </>
                    ) : null}
                    {card.state === "ready" ? (
                      <>
                        <img src={CHARACTER_PREVIEW} alt="" />
                        <span>{card.label}</span>
                        <em
                          className={
                            card.using
                              ? "studioCharacterShareUseTag studioCharacterShareUseTag--active"
                              : "studioCharacterShareUseTag"
                          }
                        >
                          {card.using ? "Using" : "USE"}
                        </em>
                      </>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {scenario === "detail" ? (
          <CharacterViewScreen
            code={SAMPLE_CODE}
            privateOnly={privateOnly}
            onPrivateChange={setPrivateOnly}
            onBack={() => setScenario("library")}
            onDelete={() => setDeleteDialogOpen(true)}
            onUse={useCharacter}
            onShare={() => setShareSheetOpen(true)}
            onCopyCode={() => setToast("形象码已复制")}
            previewSrc={CHARACTER_PREVIEW}
          />
        ) : null}

        {scenario === "share-landing" ? (
          <ShareLandingDouyinStyle
            {...SHARE_LANDING_PROPS}
            onClose={() => setScenario("detail")}
            onOpenApp={() => {
              useCharacter();
              setToast("正在打开 TopTop…");
            }}
            onCopyCode={() => setToast("形象码已复制")}
          />
        ) : null}

        {scenario === "share-snapchat" ? (
          <ShareLandingSnapchatStyle
            {...SHARE_LANDING_PROPS}
            onClose={() => setScenario("detail")}
            onOpenApp={() => {
              useCharacter();
              setToast("正在打开 TopTop…");
            }}
            onCopyCode={() => setToast("形象码已复制")}
          />
        ) : null}

        {scenario === "error" ? (
          <>
            <RegularNavigation
              title="View Characters"
              onBack={() => setScenario("library")}
            />
            <div className="pageCanvasContentShell studioCharacterShareScroll studioCharacterShareError">
              <div className="studioCharacterShareBroken" aria-hidden="true" />
              <p>形象数据不完整，请重试或删除后重新生成。</p>
              <div className="studioCharacterShareErrorActions">
                <button
                  type="button"
                  className="kitButton kitButton--height40 kitButton--neutral"
                  onClick={() => setScenario("library")}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="kitButton kitButton--height40 kitButton--primary"
                  onClick={() => {
                    setScenario("generate");
                    resetGenerateFlow();
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          </>
        ) : null}

        <ActionPanelSheet
          open={shareSheetOpen}
          dismissible
          onDismiss={() => setShareSheetOpen(false)}
          header={{
            title: "Share my Characters",
            backLabel: "关闭",
            onBack: () => setShareSheetOpen(false),
          }}
          description={`Characters code ${SAMPLE_CODE}`}
          actions={[
            {
              id: "copy",
              label: "复制形象码",
              onPress: () => setToast("形象码已复制"),
            },
            {
              id: "im",
              label: "发送到 IM",
              onPress: () => setToast("已打开 IM 分享预览"),
            },
            {
              id: "link",
              label: "复制链接",
              onPress: () => {
                setShareSheetOpen(false);
                setScenario("share-landing");
              },
            },
          ]}
        />

        <CenterDialog
          open={deleteDialogOpen}
          title="删除形象？"
          description="删除后无法恢复，正在使用的形象将切换为默认形象。"
          actions={[
            {
              id: "delete",
              label: "删除",
              tone: "destructive",
              onPress: confirmDeleteCharacter,
            },
            {
              id: "cancel",
              label: "取消",
              tone: "neutral",
              onPress: () => setDeleteDialogOpen(false),
            },
          ]}
          dismissible
          onDismiss={() => setDeleteDialogOpen(false)}
        />

        {toast ? (
          <div className="studioCharacterShareToastHost">
            <Toast message={toast} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CharacterViewScreen({
  code,
  privateOnly,
  onPrivateChange,
  onBack,
  onDelete,
  onUse,
  onShare,
  onCopyCode,
  previewSrc,
}: {
  code: string;
  privateOnly: boolean;
  onPrivateChange: (value: boolean) => void;
  onBack: () => void;
  onDelete: () => void;
  onUse: () => void;
  onShare: () => void;
  onCopyCode: () => void;
  previewSrc: string;
}) {
  return (
    <>
      <RegularNavigation
        title="View Characters"
        onBack={onBack}
        trailing={
          <button
            type="button"
            className="studioCharacterShareNavIconBtn"
            aria-label="删除形象"
            onClick={onDelete}
          >
            <SystemIcon name="delete" size={24} />
          </button>
        }
      />
      <div className="pageCanvasContentShell studioCharacterShareScroll">
        <CharacterDetailBody
          code={code}
          privateOnly={privateOnly}
          onPrivateChange={onPrivateChange}
          onUse={onUse}
          onShare={onShare}
          onCopyCode={onCopyCode}
          previewSrc={previewSrc}
        />
      </div>
    </>
  );
}

function CharacterDetailBody({
  code,
  privateOnly,
  onPrivateChange,
  onUse,
  onShare,
  onCopyCode,
  previewSrc,
}: {
  code: string;
  privateOnly: boolean;
  onPrivateChange: (value: boolean) => void;
  onUse: () => void;
  onShare: () => void;
  onCopyCode: () => void;
  previewSrc: string;
}) {
  return (
    <div className="studioCharacterShareDetail">
      <div className="studioCharacterSharePreview">
        <img src={previewSrc} alt="" />
      </div>
      <div className="studioCharacterShareAuthor">
        <AvatarVisual
          size={32}
          src="/prototypes/feed/andrew-avatar.png"
          alt=""
        />
        <div>
          <span>Author</span>
          <strong>NameName</strong>
        </div>
      </div>
      <dl className="studioCharacterShareMeta">
        <div>
          <dt>Characters code</dt>
          <dd>
            {code}
            <button
              type="button"
              className="studioCharacterShareCopy"
              aria-label="复制形象码"
              onClick={onCopyCode}
            >
              <SystemIcon name="copy" size={16} />
            </button>
          </dd>
        </div>
      </dl>
      <div className="studioCharacterShareDetailActions">
        <button
          type="button"
          className="kitButton kitButton--height48 kitButton--primary"
          onClick={onUse}
        >
          Use
        </button>
        <button
          type="button"
          className="kitButton kitButton--height48 kitButton--neutral-outline"
          onClick={onShare}
        >
          share
        </button>
      </div>
      <button
        type="button"
        className={
          privateOnly
            ? "studioCharacterSharePrivate studioCharacterSharePrivate--on"
            : "studioCharacterSharePrivate"
        }
        aria-pressed={privateOnly}
        onClick={() => onPrivateChange(!privateOnly)}
      >
        <span aria-hidden="true">{privateOnly ? "✓" : "○"}</span>
        只能我自己用（不能被搜索，不上热门）
      </button>
    </div>
  );
}

/** 站外分享落地：结构参考抖音 H5（沉浸预览 + 顶栏打开 App + 底部强 CTA），视觉仍用 TopTop Token */
function ShareLandingDouyinStyle({
  inviterName,
  inviterAvatar,
  characterCode,
  previewSrc,
  onClose,
  onOpenApp,
  onCopyCode,
}: {
  inviterName: string;
  inviterAvatar: string;
  characterCode: string;
  previewSrc: string;
  onClose: () => void;
  onOpenApp: () => void;
  onCopyCode: () => void;
}) {
  return (
    <div
      className="pageCanvasContentShell studioCharacterShareDouyin"
      aria-label="站外形象分享落地页"
    >
      <header className="studioCharacterShareDouyinTop">
        <button
          type="button"
          className="studioCharacterShareDouyinBrand"
          aria-label="TopTop"
          onClick={onOpenApp}
        >
          <span className="studioCharacterShareDouyinLogo" aria-hidden="true">
            T
          </span>
          <span>TopTop</span>
        </button>
        <button
          type="button"
          className="studioCharacterShareDouyinTopOpen"
          onClick={onOpenApp}
        >
          打开 App
        </button>
        <button
          type="button"
          className="studioCharacterShareDouyinClose"
          aria-label="关闭预览"
          onClick={onClose}
        >
          <SystemIcon name="close" size={20} />
        </button>
      </header>

      <main className="studioCharacterShareDouyinStage">
        <div className="studioCharacterShareDouyinPreview" aria-label="形象预览">
          <img src={previewSrc} alt="" />
          <div className="studioCharacterShareDouyinPreviewFade" aria-hidden="true" />
          <div className="studioCharacterShareDouyinAuthor">
            <AvatarVisual size={40} src={inviterAvatar} alt="" />
            <div className="studioCharacterShareDouyinAuthorText">
              <strong>@{inviterName}</strong>
              <span>分享了一个 AI 形象</span>
            </div>
          </div>
        </div>
        <p className="studioCharacterShareDouyinHook">
          上 TopTop 使用同款形象，一起进房玩
        </p>
      </main>

      <footer className="studioCharacterShareDouyinDock">
        <button
          type="button"
          className="kitButton kitButton--height48 kitButton--primary studioCharacterShareDouyinCta"
          onClick={onOpenApp}
        >
          打开 TopTop
        </button>
        <button
          type="button"
          className="studioCharacterShareDouyinSecondary"
          onClick={onCopyCode}
        >
          复制形象码 {characterCode}
        </button>
        <p className="studioCharacterShareDouyinFootnote">
          已安装 TopTop 将自动跳转；未安装请前往应用商店下载
        </p>
      </footer>
    </div>
  );
}

/** 站外分享落地：结构参考 Snapchat（好友邀请卡 + 圆角预览 + 底部胶囊 CTA），视觉仍用 TopTop Token */
function ShareLandingSnapchatStyle({
  inviterName,
  inviterAvatar,
  characterCode,
  previewSrc,
  onClose,
  onOpenApp,
  onCopyCode,
}: {
  inviterName: string;
  inviterAvatar: string;
  characterCode: string;
  previewSrc: string;
  onClose: () => void;
  onOpenApp: () => void;
  onCopyCode: () => void;
}) {
  return (
    <div
      className="pageCanvasContentShell studioCharacterShareSnap"
      aria-label="站外形象分享落地页 Snap 风格"
    >
      <header className="studioCharacterShareSnapTop">
        <button
          type="button"
          className="studioCharacterShareSnapClose"
          aria-label="关闭预览"
          onClick={onClose}
        >
          <SystemIcon name="close" size={24} />
        </button>
      </header>

      <main className="studioCharacterShareSnapMain">
        <div className="studioCharacterShareSnapInvite" role="status">
          <AvatarVisual size={36} src={inviterAvatar} alt="" />
          <p>
            <strong>{inviterName}</strong> sent you a Character
          </p>
        </div>

        <h2 className="studioCharacterShareSnapTitle">Try this look together</h2>
        <p className="studioCharacterShareSnapSubtitle">
          Open TopTop to add it to your library and jump into a room.
        </p>

        <div className="studioCharacterShareSnapCard" aria-label="形象预览">
          <img src={previewSrc} alt="" />
          <button
            type="button"
            className="studioCharacterShareSnapCodeChip"
            onClick={onCopyCode}
          >
            <SystemIcon name="copy" size={16} />
            {characterCode}
          </button>
        </div>
      </main>

      <footer className="studioCharacterShareSnapDock">
        <button
          type="button"
          className="kitButton kitButton--height48 kitButton--primary studioCharacterShareSnapCta"
          onClick={onOpenApp}
        >
          Open TopTop
        </button>
        <button
          type="button"
          className="studioCharacterShareSnapLink"
          onClick={onCopyCode}
        >
          Copy code instead
        </button>
      </footer>
    </div>
  );
}

function CharacterCodeDialog({
  value,
  ready,
  onChange,
  onDismiss,
  onConfirm,
}: {
  value: string;
  ready: boolean;
  onChange: (value: string) => void;
  onDismiss: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="kitCenterDialogOverlay" role="presentation">
      <button
        type="button"
        className="kitCenterDialogBackdrop"
        aria-label="关闭"
        onClick={onDismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="character-code-title"
        className="kitCenterDialog studioCharacterShareCodeDialog"
      >
        <div className="kitCenterDialogTextRegion">
          <h2 id="character-code-title" className="kitCenterDialogTitle">
            Use Characters Code
          </h2>
          <p className="kitCenterDialogDescription">
            Using Characters edited by other users, usually shared by friends.
          </p>
          <label className="studioCharacterShareCodeField">
            <span className="visuallyHidden">Character code</span>
            <input
              type="text"
              value={value}
              placeholder="Please enter or paste"
              aria-label="Please enter or paste character code"
              onChange={(event) => onChange(event.target.value.toUpperCase())}
            />
          </label>
        </div>
        <div className="kitCenterDialogActionRegion">
          <div className="kitCenterDialogActions kitCenterDialogActions--single">
            <button
              type="button"
              className="kitButton kitButton--height40 kitButton--primary"
              disabled={!ready}
              onClick={onConfirm}
            >
              ok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
