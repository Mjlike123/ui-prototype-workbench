"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { PillSecondaryTab } from "@/components/kit/pill-secondary-tab";
import { PrimaryNavigation } from "@/components/kit/primary-navigation";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { RegularListItem } from "@/components/kit/regular-list-item";
import { SearchControl } from "@/components/kit/search-control";
import { SystemIcon } from "@/components/kit/system-icon";
import { TextSecondaryTab } from "@/components/kit/text-secondary-tab";
import { Toast } from "@/components/kit/toast";
import { UnderlineSecondaryTab } from "@/components/kit/underline-secondary-tab";
import { PrimaryNavigationSearchIcon } from "@/components/primary-navigation-search-icon";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import {
  iphoneDuoChromeAxis,
  iphoneDuoContentShellClass,
  iphoneDuoDeviceChromeClass,
  iphoneDuoReservedVars,
  isIphoneDuoInnerCanvas,
} from "@/lib/iphone-duo-layout";

type RedesignScene =
  | "compare"
  | "quality"
  | "fujistyle"
  | "fuji-recipes"
  | "recipe-room"
  | "filmsim";

type FilmsimSortTab = "hot" | "latest" | "az";

type RecipeRoomMode = "post" | "recipe";

const SCENES: Array<{ id: RedesignScene; label: string }> = [
  { id: "quality", label: "精选方向 · 暗房工作台" },
  { id: "compare", label: "模块对照表" },
  { id: "filmsim", label: "D · Filmsim 竞品参考" },
  { id: "fujistyle", label: "A · FujiStyle 灵感流" },
  { id: "fuji-recipes", label: "B · Fuji Recipes 工作台" },
  { id: "recipe-room", label: "C · Recipe Room 双轨" },
];

const SAMPLE_PHOTOS = [
  "/prototypes/feed/latifa-photo.png",
  "/prototypes/feed/latifa-photo.png",
] as const;

const MOCK_RECIPES = [
  {
    id: "classic-neg-paris",
    title: "盛夏巴黎 · 街头",
    filmSim: "Classic Neg",
    shorthand: "DR400 · 颗粒 弱 · 色彩 +2",
    camera: "X100VI",
    saves: "1.2k",
    imports: "3.8k",
    likes: "666",
    author: "@leica_walk",
    verified: true,
  },
  {
    id: "cc-portrait",
    title: "柔光人像 · 室内",
    filmSim: "Classic Chrome",
    shorthand: "DR200 · 颗粒 关 · 白平衡 阴天",
    camera: "X-T5",
    saves: "892",
    imports: "1.6k",
    likes: "412",
    author: "@film_daily",
    verified: false,
  },
] as const;

const FILMSIM_GRID = [
  {
    id: "summer-made",
    title: "Summer Made",
    filmSim: "CLASSIC CHROME",
    author: "@gr.scha",
    likes: "4.4k",
    imports: "12.8k",
    verified: true,
    media: "/prototypes/feed/latifa-photo.png",
  },
  {
    id: "cuban-neg",
    title: "Classic Cuban Neg",
    filmSim: "CLASSIC NEGATIVE",
    author: "@osanbilgi",
    likes: "2.3k",
    imports: "9.1k",
    verified: true,
    media: "/prototypes/feed/latifa-photo.png",
  },
  {
    id: "cafe",
    title: "Green Patio",
    filmSim: "PROVIA",
    author: "@street.lab",
    likes: "2.3k",
    imports: "5.4k",
    verified: false,
    media: "/prototypes/feed/latifa-photo.png",
  },
  {
    id: "nyc",
    title: "City Blue Hour",
    filmSim: "ETERNA",
    author: "@night.frame",
    likes: "1.7k",
    imports: "7.2k",
    verified: true,
    media: "/prototypes/feed/latifa-photo.png",
  },
] as const;

const FILMSIM_FILTERS = [
  "适合我的 X-T50",
  "心情",
  "胶片模拟",
  "相机",
] as const;

type QualityRecipeFilter = "for-you" | "portrait" | "night";

type QualityRecipe = {
  id: string;
  title: string;
  filmSim: string;
  description: string;
  author: string;
  authorAvatar: string;
  camera: string;
  compatibility: string;
  writes: string;
  saves: string;
  samples: string;
  media?: string;
  mediaAlt: string;
  palette?: readonly string[];
  filter: Exclude<QualityRecipeFilter, "for-you">;
  parameters: readonly { label: string; value: string }[];
};

const QUALITY_RECIPES: readonly QualityRecipe[] = [
  {
    id: "afterglow-portrait",
    title: "窗边暖调",
    filmSim: "Classic Neg",
    description: "压住窗边高光，把室内肤色留得温暖又克制。",
    author: "Leica Walk",
    authorAvatar: "/prototypes/feed/latifa-avatar.png",
    camera: "X100VI",
    compatibility: "X100VI · X-T50 · X-S20",
    writes: "3.8k",
    saves: "6.2k",
    samples: "18",
    media: "/prototypes/feed/latifa-photo.png",
    mediaAlt: "傍晚餐厅中的暖色人像样张",
    filter: "portrait",
    parameters: [
      { label: "动态范围", value: "DR400" },
      { label: "白平衡", value: "WB 5200K" },
      { label: "色彩", value: "Color +2" },
      { label: "高光", value: "Highlight -1" },
      { label: "阴影", value: "Shadow +1" },
      { label: "颗粒", value: "Grain Weak" },
      { label: "清晰度", value: "Clarity -2" },
      { label: "彩色效果", value: "Chrome Weak" },
    ],
  },
  {
    id: "midnight-indigo",
    title: "午夜靛蓝",
    filmSim: "Eterna",
    description: "保留暗部层次，让室内灯光像电影长镜头。",
    author: "Night Frame",
    authorAvatar: "/prototypes/toptop-home/header-avatar.png",
    camera: "X100VI",
    compatibility: "X100VI · X-T50",
    writes: "2.1k",
    saves: "4.4k",
    samples: "12",
    media: "/prototypes/studio/spin-bottle-booth.jpg",
    mediaAlt: "紫蓝色环形沙发与中央火炉的夜景样张",
    filter: "night",
    parameters: [
      { label: "动态范围", value: "DR200" },
      { label: "白平衡", value: "WB 4300K" },
      { label: "色彩", value: "Color -1" },
      { label: "高光", value: "Highlight -2" },
      { label: "阴影", value: "Shadow -2" },
      { label: "颗粒", value: "Grain Strong" },
      { label: "清晰度", value: "Clarity -3" },
      { label: "彩色效果", value: "Chrome Strong" },
    ],
  },
  {
    id: "quiet-cinema",
    title: "柔雾电影",
    filmSim: "Classic Chrome",
    description: "降低反差，用干净的灰调突出人物轮廓。",
    author: "Cassie Lin",
    authorAvatar: "/prototypes/toptop-home/avatar-cassie.png",
    camera: "X-T5",
    compatibility: "X-T5 · X-H2 · X-S20",
    writes: "1.6k",
    saves: "3.1k",
    samples: "9",
    mediaAlt: "柔雾电影配方的灰蓝、肤色与暖棕色调板",
    palette: ["#77808c", "#d7b59f", "#6f5148", "#d9d3c8"],
    filter: "portrait",
    parameters: [
      { label: "动态范围", value: "DR200" },
      { label: "白平衡", value: "WB Auto" },
      { label: "色彩", value: "Color -2" },
      { label: "高光", value: "Highlight -1" },
      { label: "阴影", value: "Shadow -1" },
      { label: "颗粒", value: "Grain Weak" },
      { label: "清晰度", value: "Clarity -2" },
      { label: "彩色效果", value: "Chrome Off" },
    ],
  },
] as const;

export type RecipeCommunityRedesignScene = RedesignScene;

type StudioRecipeCommunityRedesignPageProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  initialScene?: RedesignScene;
  hideSceneChrome?: boolean;
  onBack?: () => void;
};

/** Studio-only · 配方社区首页三方案探索（对标 FujiStyle / Fuji Recipes / Recipe Room） */
export function StudioRecipeCommunityRedesignPage({
  width = 375,
  height = 812,
  theme = "dark",
  initialScene = "quality",
  hideSceneChrome = false,
  onBack,
}: StudioRecipeCommunityRedesignPageProps) {
  const [scene, setScene] = useState<RedesignScene>(initialScene);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fujiRecipesTab, setFujiRecipesTab] = useState<"discover" | "saved">(
    "discover",
  );
  const [recipeRoomMode, setRecipeRoomMode] = useState<RecipeRoomMode>("recipe");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const [filmsimSort, setFilmsimSort] = useState<FilmsimSortTab>("hot");

  const deviceTheme = scene === "filmsim" ? "light" : theme;
  const statusAppearance =
    deviceTheme === "dark" ? "light-content" : "dark-content";
  const qualityChromeAxis = iphoneDuoChromeAxis(width, height);
  const qualityInnerCanvas = isIphoneDuoInnerCanvas(width);
  const qualitySideChrome =
    scene === "quality" && qualityChromeAxis === "vertical";

  const notify = (message: string) => setToast(message);

  return (
    <div
      className={[
        "studioVoiceRoomStatusShell",
        "studioRecipeCommunityShell",
        hideSceneChrome ? "studioRecipeCommunityShell--capture" : "",
        theme === "dark" ? "studioRecipeCommunityShell--dark" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--page-canvas-width": `${width}px` } as CSSProperties}
    >
      {hideSceneChrome ? null : (
        <div
          className="studioVoiceRoomStatusScenes studioRecipeCommunitySceneTabs"
          role="tablist"
          aria-label="配方社区改版方案"
        >
          {SCENES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              className={[
                "studioVoiceRoomStatusSceneTab",
                scene === item.id ? "studioVoiceRoomStatusSceneTab--active" : "",
              ]
                  .filter(Boolean)
                  .join(" ")}
              aria-selected={scene === item.id}
              onClick={() => setScene(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {scene === "compare" ? (
        <ModuleComparisonTable />
      ) : (
        <div
          className={[
            "pageCanvasDevice",
            "studioRecipeCommunityDevice",
            scene === "quality"
              ? "studioRecipeCommunityDevice--quality"
              : "",
            scene === "quality" && qualityInnerCanvas
              ? "studioRecipeCommunityDevice--qualityInner"
              : "",
            scene === "filmsim"
              ? "studioRecipeCommunityDevice--filmsim"
              : deviceTheme === "dark"
                ? "studioRecipeCommunityDevice--dark"
                : "",
            scene === "quality"
              ? iphoneDuoDeviceChromeClass(width, height)
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={
            {
              "--page-canvas-width": `${width}px`,
              "--page-canvas-height": `${height}px`,
              ...(scene === "quality"
                ? iphoneDuoReservedVars(width, height)
                : {}),
            } as CSSProperties
          }
          aria-label={`配方社区改版 · ${scene}`}
        >
          {qualitySideChrome ? null : (
            <IosStatusBar appearance={statusAppearance} />
          )}
          <div
            className={
              scene === "quality"
                ? `${iphoneDuoContentShellClass(width, height)} studioRecipeCommunityContent`
                : "pageCanvasContentShell studioRecipeCommunityContent"
            }
          >
            {scene === "quality" ? (
              <QualityRecipeHome
                width={width}
                height={height}
                searchActive={searchActive}
                searchQuery={searchQuery}
                onSearchActivate={() => setSearchActive(true)}
                onSearchCancel={() => {
                  setSearchActive(false);
                  setSearchQuery("");
                }}
                onSearchChange={setSearchQuery}
                onAction={notify}
              />
            ) : null}
            {scene === "fujistyle" ? (
              <FujiStyleHome
                searchActive={searchActive}
                searchQuery={searchQuery}
                onSearchActivate={() => setSearchActive(true)}
                onSearchCancel={() => {
                  setSearchActive(false);
                  setSearchQuery("");
                }}
                onSearchChange={setSearchQuery}
                onAction={notify}
                onBack={onBack}
              />
            ) : null}
            {scene === "fuji-recipes" ? (
              <FujiRecipesHome
                tab={fujiRecipesTab}
                onTabChange={setFujiRecipesTab}
                searchActive={searchActive}
                searchQuery={searchQuery}
                onSearchActivate={() => setSearchActive(true)}
                onSearchCancel={() => {
                  setSearchActive(false);
                  setSearchQuery("");
                }}
                onSearchChange={setSearchQuery}
                onAction={notify}
              />
            ) : null}
            {scene === "recipe-room" ? (
              <RecipeRoomHome
                mode={recipeRoomMode}
                onModeChange={setRecipeRoomMode}
                searchActive={searchActive}
                searchQuery={searchQuery}
                onSearchActivate={() => setSearchActive(true)}
                onSearchCancel={() => {
                  setSearchActive(false);
                  setSearchQuery("");
                }}
                onSearchChange={setSearchQuery}
                onAction={notify}
                onBack={onBack}
              />
            ) : null}
            {scene === "filmsim" ? (
              <FilmsimRecipesHome
                sortTab={filmsimSort}
                onSortChange={setFilmsimSort}
                searchActive={searchActive}
                searchQuery={searchQuery}
                onSearchActivate={() => setSearchActive(true)}
                onSearchCancel={() => {
                  setSearchActive(false);
                  setSearchQuery("");
                }}
                onSearchChange={setSearchQuery}
                onAction={notify}
              />
            ) : null}
          </div>
          {toast ? <Toast message={toast} /> : null}
        </div>
      )}
    </div>
  );
}

function ModuleComparisonTable() {
  return (
    <section
      className="studioRecipeCommunityCompare studioRecipeCommunityCompare--onBlack"
      aria-labelledby="recipe-community-compare-title"
    >
      <header className="studioRecipeCommunityCompareHeader">
        <h2 id="recipe-community-compare-title">首页模块对照表</h2>
        <p>
          映射改版清单 P0：单一导航、去重重筛、配方可读、写机闭环、组/单实体分层。
        </p>
      </header>
      <div className="studioRecipeCommunityCompareScroll">
        <table className="studioRecipeCommunityCompareTable">
          <thead>
            <tr>
              <th scope="col">模块</th>
              <th scope="col">A FujiStyle</th>
              <th scope="col">B Fuji Recipes</th>
              <th scope="col">C Recipe Room</th>
              <th scope="col">D Filmsim</th>
              <th scope="col">改版清单</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">顶栏</th>
              <td>社区 Tab + 搜索 + 头像；强调 UGC 身份</td>
              <td>机身连接态 + 同步 + 搜索；工具心智</td>
              <td>标题 + 作品/配方分段；实体切换</td>
              <td>品牌 + 通知 + 头像；底栏配方 Tab</td>
              <td>P0 单一主导航；相机/备份上首页</td>
            </tr>
            <tr>
              <th scope="row">筛选</th>
              <td>场景 chip（人像/风景）+ 编辑推荐 Hero</td>
              <td>传感器 / 胶片模拟 / 场景，仅一处 Sticky</td>
              <td>随分段变化：作品=地点/色调；配方=模拟/机型</td>
              <td>适合我的机身 + 心情/模拟/相机下拉</td>
              <td>P0 去掉三层重复筛</td>
            </tr>
            <tr>
              <th scope="row">卡片字段</th>
              <td>大图 + @作者 + 点赞 + 胶片角标</td>
              <td>缩略图 + 模拟名 + 参数一行 + 机型 + 收藏数</td>
              <td>作品格：样张；配方行：参数表摘要</td>
              <td>双列 + 图右下「导入次数」角标</td>
              <td>P0 可读模拟/参数；P1 区分组 vs 单配方</td>
            </tr>
            <tr>
              <th scope="row">主 CTA</th>
              <td>收藏 / 存配方（社交闭环）</td>
              <td>写入相机 / 打开 Darkroom 预览</td>
              <td>应用配方 / 从作品分析参数</td>
              <td>点心收藏；底栏红色相机 FAB</td>
              <td>P0 首页可见「用起来」</td>
            </tr>
            <tr>
              <th scope="row">配方组</th>
              <td>横滑合集 +「7 配方」角标</td>
              <td>「我的相机槽位」+ 官方合集入口</td>
              <td>仅配方轨展示组；作品轨不出现组</td>
              <td>Pro 配方黑卡横幅（订阅）</td>
              <td>P0 组与单卡视觉分层</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function QualityRecipeHome({
  width,
  height,
  searchActive,
  searchQuery,
  onSearchActivate,
  onSearchCancel,
  onSearchChange,
  onAction,
}: {
  width: number;
  height: number;
  searchActive: boolean;
  searchQuery: string;
  onSearchActivate: () => void;
  onSearchCancel: () => void;
  onSearchChange: (value: string) => void;
  onAction: (message: string) => void;
}) {
  const [nav, setNav] = useState<"featured" | "saved">("featured");
  const [filter, setFilter] = useState<QualityRecipeFilter>("for-you");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<QualityRecipe>(
    QUALITY_RECIPES[0],
  );
  const [writeRecipe, setWriteRecipe] = useState<QualityRecipe | null>(null);
  const [writeSheetOpen, setWriteSheetOpen] = useState(false);
  const [writeSheetStage, setWriteSheetStage] = useState<"choose" | "confirm">(
    "choose",
  );
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);
  const [writePhase, setWritePhase] = useState<"idle" | "writing" | "success">(
    "idle",
  );
  const [writtenSlot, setWrittenSlot] = useState<string | null>(null);

  const sideChrome = iphoneDuoChromeAxis(width, height) === "vertical";
  const innerCanvas = isIphoneDuoInnerCanvas(width);

  const visibleRecipes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return QUALITY_RECIPES.filter((recipe) => {
      if (nav === "saved" && !savedIds.includes(recipe.id)) return false;
      if (filter !== "for-you" && recipe.filter !== filter) return false;
      if (!normalizedQuery) return true;
      return [
        recipe.title,
        recipe.filmSim,
        recipe.author,
        recipe.camera,
        recipe.description,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [filter, nav, savedIds, searchQuery]);

  useEffect(() => {
    if (writePhase !== "writing" || !writeRecipe || !pendingSlot) return;
    const timer = window.setTimeout(() => {
      setWrittenSlot(`${pendingSlot} · ${writeRecipe.title}`);
      setWritePhase("success");
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [pendingSlot, writePhase, writeRecipe]);

  const toggleSaved = (recipe: QualityRecipe) => {
    setSavedIds((current) =>
      current.includes(recipe.id)
        ? current.filter((id) => id !== recipe.id)
        : [...current, recipe.id],
    );
  };

  const openWriteFlow = (recipe: QualityRecipe) => {
    setSelectedRecipe(recipe);
    setWriteRecipe(recipe);
    setWriteSheetStage("choose");
    setPendingSlot(null);
    setWriteSheetOpen(true);
  };

  const chooseSlot = (slot: string, occupied: boolean) => {
    setPendingSlot(slot);
    if (occupied) {
      setWriteSheetStage("confirm");
      return;
    }
    setWriteSheetOpen(false);
    setWritePhase("writing");
  };

  const startOverwrite = () => {
    setWriteSheetOpen(false);
    setWritePhase("writing");
  };

  const heroVisible =
    !innerCanvas &&
    nav === "featured" &&
    filter === "for-you" &&
    !searchQuery.trim();
  const cardRecipes = heroVisible
    ? visibleRecipes.filter((recipe) => recipe.id !== QUALITY_RECIPES[0].id)
    : visibleRecipes;

  return (
    <div
      className={[
        "studioRecipeQualityExperience",
        sideChrome ? "studioRecipeQualityExperience--sideChrome" : "",
        innerCanvas ? "studioRecipeQualityExperience--inner" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {sideChrome ? (
        <nav className="studioRecipeQualitySideRail" aria-label="配方社区导航">
          <button
            type="button"
            className={nav === "featured" ? "selected" : ""}
            aria-current={nav === "featured" ? "page" : undefined}
            onClick={() => setNav("featured")}
          >
            <SystemIcon name="photo" size={22} />
            <span>精选</span>
          </button>
          <button
            type="button"
            className={nav === "saved" ? "selected" : ""}
            aria-current={nav === "saved" ? "page" : undefined}
            onClick={() => setNav("saved")}
          >
            <SystemIcon name="followed" size={22} />
            <span>收藏</span>
          </button>
          <button
            type="button"
            onClick={() => onAction(writtenSlot ?? "X100VI 已连接")}
          >
            <SystemIcon name="settings" size={22} />
            <span>相机</span>
          </button>
          <button
            type="button"
            onClick={onSearchActivate}
            aria-label="搜索配方"
          >
            <SystemIcon name="search" size={22} />
            <span>搜索</span>
          </button>
        </nav>
      ) : null}

      <div className="studioRecipeQualityMain">
        {!sideChrome ? (
          <PrimaryNavigation
            className="studioRecipeQualityNav"
            items={[
              { key: "featured", label: "精选" },
              { key: "saved", label: "收藏" },
            ]}
            value={nav}
            onChange={(key) => setNav(key as "featured" | "saved")}
            actions={[
              {
                key: "search",
                label: "搜索配方",
                icon: <PrimaryNavigationSearchIcon />,
                onPress: onSearchActivate,
              },
            ]}
            ariaLabel="配方社区"
          />
        ) : null}

        {searchActive ? (
          <div className="studioRecipeCommunitySearchSlot">
            <SearchControl
              value={searchQuery}
              active
              placeholder="配方、胶片模拟、创作者"
              ariaLabel="搜索配方社区"
              onActivate={onSearchActivate}
              onChange={onSearchChange}
              onCancel={onSearchCancel}
              onSubmit={(value) => onAction(`搜索「${value}」`)}
            />
          </div>
        ) : null}

        <main
          className="studioRecipeQualityScroll"
          aria-label={nav === "featured" ? "精选配方" : "收藏的配方"}
        >
          <button
            type="button"
            className="studioRecipeQualityCamera"
            onClick={() => onAction(writtenSlot ?? "X100VI 已连接，C1 可写入")}
          >
            <span className="studioRecipeQualityCameraStatus" aria-hidden="true" />
            <span>
              <strong>X100VI 已连接</strong>
              <small>{writtenSlot ?? "C1 空闲 · 电量 82%"}</small>
            </span>
            <SystemIcon name="chevronRight" size={18} />
          </button>

          {heroVisible ? (
            <article className="studioRecipeQualityHero">
              <button
                type="button"
                className="studioRecipeQualityHeroMedia"
                onClick={() => setSelectedRecipe(QUALITY_RECIPES[0])}
                aria-label={`查看配方 ${QUALITY_RECIPES[0].title}`}
              >
                <Image
                  src={QUALITY_RECIPES[0].media!}
                  alt={QUALITY_RECIPES[0].mediaAlt}
                  width={686}
                  height={460}
                  sizes={innerCanvas ? "40vw" : "calc(100vw - 32px)"}
                  priority
                />
                <span className="studioRecipeQualityEdition">
                  EDITOR&apos;S DROP · 01
                </span>
              </button>
              <div className="studioRecipeQualityHeroCopy">
                <div>
                  <p className="studioRecipeQualityEyebrow">
                    {QUALITY_RECIPES[0].filmSim} · {QUALITY_RECIPES[0].camera}
                  </p>
                  <h1>{QUALITY_RECIPES[0].title}</h1>
                  <p>{QUALITY_RECIPES[0].description}</p>
                  <span className="studioRecipeQualityAuthor">
                    <AvatarVisual
                      src={QUALITY_RECIPES[0].authorAvatar}
                      alt=""
                      size={24}
                    />
                    <span>
                      {QUALITY_RECIPES[0].author} · {QUALITY_RECIPES[0].samples} 张样片
                      · {QUALITY_RECIPES[0].writes} 人已写入
                    </span>
                  </span>
                </div>
                <div className="studioRecipeQualityHeroActions">
                  <button
                    type="button"
                    className="studioRecipeQualitySaveButton"
                    aria-label={`${
                      savedIds.includes(QUALITY_RECIPES[0].id)
                        ? "取消收藏"
                        : "收藏"
                    } ${QUALITY_RECIPES[0].title}`}
                    aria-pressed={savedIds.includes(QUALITY_RECIPES[0].id)}
                    onClick={() => toggleSaved(QUALITY_RECIPES[0])}
                  >
                    <SystemIcon
                      name={
                        savedIds.includes(QUALITY_RECIPES[0].id)
                          ? "followed"
                          : "add"
                      }
                      size={20}
                    />
                    <span>
                      {savedIds.includes(QUALITY_RECIPES[0].id)
                        ? "已收藏"
                        : "收藏"}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="kitButton kitButton--height40 kitButton--primary studioRecipeQualityWriteButton"
                    onClick={() => openWriteFlow(QUALITY_RECIPES[0])}
                  >
                    写入相机
                  </button>
                </div>
              </div>
            </article>
          ) : null}

          <PillSecondaryTab
            className="studioRecipeQualityFilters"
            ariaLabel="配方筛选"
            items={[
              { key: "for-you", label: "为你推荐" },
              { key: "portrait", label: "人像" },
              { key: "night", label: "夜色" },
            ]}
            value={filter}
            onChange={(key) => setFilter(key as QualityRecipeFilter)}
          />

          <section
            className="studioRecipeQualityFeed"
            aria-labelledby="quality-recipe-feed-title"
          >
            <header>
              <div>
                <p>{nav === "featured" ? "为你的相机精选" : "你的配方库"}</p>
                <h2 id="quality-recipe-feed-title">
                  {nav === "featured" ? "继续探索" : "已收藏"}
                </h2>
              </div>
              <span>{visibleRecipes.length} 个配方</span>
            </header>

            {cardRecipes.length ? (
              <div className="studioRecipeQualityGrid">
                {cardRecipes.map((recipe) => (
                  <QualityRecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    saved={savedIds.includes(recipe.id)}
                    selected={selectedRecipe.id === recipe.id}
                    onSelect={() => {
                      setSelectedRecipe(recipe);
                      if (!innerCanvas) onAction(`已选择：${recipe.title}`);
                    }}
                    onSave={() => toggleSaved(recipe)}
                    onWrite={() => openWriteFlow(recipe)}
                  />
                ))}
              </div>
            ) : (
              <div className="studioRecipeQualityEmpty">
                <SystemIcon name="photo" size={28} />
                <h3>{nav === "saved" ? "还没有收藏配方" : "没有匹配的配方"}</h3>
                <p>
                  {nav === "saved"
                    ? "在精选页收藏喜欢的色彩，再回来统一写入相机。"
                    : "换一个关键词或清除筛选后再试。"}
                </p>
                <button
                  type="button"
                  className="kitButton kitButton--height40 kitButton--neutral-outline"
                  onClick={() => {
                    setNav("featured");
                    setFilter("for-you");
                    onSearchCancel();
                  }}
                >
                  查看精选
                </button>
              </div>
            )}
          </section>
        </main>
      </div>

      {innerCanvas ? (
        <QualityRecipeDetail
          recipe={selectedRecipe}
          saved={savedIds.includes(selectedRecipe.id)}
          onSave={() => toggleSaved(selectedRecipe)}
          onWrite={() => openWriteFlow(selectedRecipe)}
        />
      ) : null}

      <PrototypeWriteSheet
        open={writeSheetOpen}
        stage={writeSheetStage}
        recipe={writeRecipe}
        pendingSlot={pendingSlot}
        onChoose={chooseSlot}
        onConfirm={startOverwrite}
        onBack={() => setWriteSheetStage("choose")}
        onDismiss={() => setWriteSheetOpen(false)}
      />

      <PrototypeWriteStatus
        phase={writePhase}
        recipe={writeRecipe}
        slot={pendingSlot}
        onCancel={() => setWritePhase("idle")}
        onDone={() => {
          setWritePhase("idle");
          onAction(`${writeRecipe?.title ?? "配方"} 已写入 ${pendingSlot}`);
        }}
      />
    </div>
  );
}

function QualityRecipeCard({
  recipe,
  saved,
  selected,
  onSelect,
  onSave,
  onWrite,
}: {
  recipe: QualityRecipe;
  saved: boolean;
  selected: boolean;
  onSelect: () => void;
  onSave: () => void;
  onWrite: () => void;
}) {
  return (
    <article
      className={[
        "studioRecipeQualityCard",
        selected ? "studioRecipeQualityCard--selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="studioRecipeQualityCardMedia"
        onClick={onSelect}
        aria-label={`查看配方 ${recipe.title}`}
      >
        {recipe.media ? (
          <Image
            src={recipe.media}
            alt={recipe.mediaAlt}
            width={420}
            height={500}
            sizes="(max-width: 430px) 50vw, 220px"
          />
        ) : (
          <span
            className="studioRecipeQualityPalette"
            role="img"
            aria-label={recipe.mediaAlt}
          >
            {recipe.palette?.map((color) => (
              <i key={color} style={{ backgroundColor: color }} />
            ))}
          </span>
        )}
        <span>{recipe.filmSim}</span>
      </button>
      <div className="studioRecipeQualityCardCopy">
        <div>
          <h3>{recipe.title}</h3>
          <p>{recipe.author} · {recipe.camera}</p>
          <span>{recipe.writes} 人已写入</span>
        </div>
        <button
          type="button"
          className="studioRecipeQualityCardSave"
          aria-label={`${saved ? "取消收藏" : "收藏"} ${recipe.title}`}
          aria-pressed={saved}
          onClick={onSave}
        >
          <SystemIcon name={saved ? "followed" : "add"} size={18} />
          <span>{saved ? "已收藏" : "收藏"}</span>
        </button>
      </div>
      <button
        type="button"
        className="studioRecipeQualityCardWrite"
        onClick={onWrite}
      >
        写入相机
        <SystemIcon name="chevronRight" size={16} />
      </button>
    </article>
  );
}

function QualityRecipeDetail({
  recipe,
  saved,
  onSave,
  onWrite,
}: {
  recipe: QualityRecipe;
  saved: boolean;
  onSave: () => void;
  onWrite: () => void;
}) {
  return (
    <aside className="studioRecipeQualityDetail" aria-label={`${recipe.title} 详情`}>
      <div className="studioRecipeQualityDetailMedia">
        {recipe.media ? (
          <Image
            src={recipe.media}
            alt={recipe.mediaAlt}
            width={720}
            height={540}
            sizes="45vw"
          />
        ) : (
          <span
            className="studioRecipeQualityPalette studioRecipeQualityPalette--detail"
            role="img"
            aria-label={recipe.mediaAlt}
          >
            {recipe.palette?.map((color) => (
              <i key={color} style={{ backgroundColor: color }} />
            ))}
          </span>
        )}
        <span>{recipe.filmSim}</span>
      </div>
      <div className="studioRecipeQualityDetailCopy">
        <p>已选配方</p>
        <h2>{recipe.title}</h2>
        <span className="studioRecipeQualityAuthor">
          <AvatarVisual
            src={recipe.authorAvatar}
            alt=""
            size={24}
          />
          <span>
            {recipe.author} · {recipe.samples} 张样片 · {recipe.saves} 收藏
          </span>
        </span>
        <p>{recipe.description}</p>
        <p className="studioRecipeQualityCompatibility">
          兼容机型 · {recipe.compatibility}
        </p>
        <dl>
          {recipe.parameters.map((parameter) => (
            <div key={parameter.label}>
              <dt>{parameter.label}</dt>
              <dd>{parameter.value}</dd>
            </div>
          ))}
        </dl>
        <div className="studioRecipeQualityDetailActions">
          <button
            type="button"
            className="studioRecipeQualitySaveButton"
            aria-label={`${saved ? "取消收藏" : "收藏"} ${recipe.title}`}
            aria-pressed={saved}
            onClick={onSave}
          >
            <SystemIcon name={saved ? "followed" : "add"} size={20} />
            <span>{saved ? "已收藏" : "收藏"}</span>
          </button>
          <button
            type="button"
            className="kitButton kitButton--height48 kitButton--primary"
            onClick={onWrite}
          >
            写入相机
          </button>
        </div>
      </div>
    </aside>
  );
}

function PrototypeWriteSheet({
  open,
  stage,
  recipe,
  pendingSlot,
  onChoose,
  onConfirm,
  onBack,
  onDismiss,
}: {
  open: boolean;
  stage: "choose" | "confirm";
  recipe: QualityRecipe | null;
  pendingSlot: string | null;
  onChoose: (slot: string, occupied: boolean) => void;
  onConfirm: () => void;
  onBack: () => void;
  onDismiss: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  if (!open || !recipe) return null;

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onDismiss();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = panelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    );
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="studioRecipeQualitySheetBackdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onDismiss();
      }}
    >
      <div
        ref={panelRef}
        className="studioRecipeQualitySheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-write-sheet-title"
        onKeyDown={onPanelKeyDown}
      >
        <header>
          {stage === "confirm" ? (
            <button type="button" aria-label="返回槽位选择" onClick={onBack}>
              <SystemIcon name="back" size={24} />
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
          <div>
            <p>WRITE TO CAMERA</p>
            <h2 id="recipe-write-sheet-title">
              {stage === "choose" ? "选择机身槽位" : "确认覆盖配方"}
            </h2>
          </div>
          <button type="button" aria-label="关闭" onClick={onDismiss}>
            <SystemIcon name="close" size={24} />
          </button>
        </header>

        {stage === "choose" ? (
          <>
            <p className="studioRecipeQualitySheetIntro">
              将“{recipe.title}”写入 X100VI。相机保持连接，预计需要 6 秒。
            </p>
            <div className="studioRecipeQualitySlotList" role="list">
              <RegularListItem
                listType="action"
                title="C1"
                subtitle="空闲 · 推荐"
                trailing={<span className="studioRecipeQualitySlotAvailable">可用</span>}
                onPress={() => onChoose("C1", false)}
              />
              <RegularListItem
                listType="action"
                title="C2"
                subtitle="Classic Chrome · 上次写入 2 天前"
                trailing={<SystemIcon name="chevronRight" size={20} />}
                onPress={() => onChoose("C2", true)}
              />
              <RegularListItem
                listType="action"
                title="C3"
                subtitle="Soft Portrait · 已锁定"
                trailing={<span className="studioRecipeQualitySlotLocked">已占用</span>}
                onPress={() => onChoose("C3", true)}
              />
            </div>
          </>
        ) : (
          <div className="studioRecipeQualityOverwrite">
            <span className="studioRecipeQualityOverwriteIcon">
              <SystemIcon name="refresh" size={24} />
            </span>
            <h3>覆盖 {pendingSlot} 中的现有配方？</h3>
            <p>原配方仍保留在收藏中，你可以稍后再次写回相机。</p>
            <button
              type="button"
              className="kitButton kitButton--height48 kitButton--primary"
              onClick={onConfirm}
            >
              覆盖并写入
            </button>
            <button
              type="button"
              className="kitButton kitButton--height48 kitButton--neutral-outline"
              onClick={onBack}
            >
              选择其他槽位
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PrototypeWriteStatus({
  phase,
  recipe,
  slot,
  onCancel,
  onDone,
}: {
  phase: "idle" | "writing" | "success";
  recipe: QualityRecipe | null;
  slot: string | null;
  onCancel: () => void;
  onDone: () => void;
}) {
  if (phase === "idle" || !recipe || !slot) return null;
  const success = phase === "success";

  return (
    <div
      className="studioRecipeQualityStatusBackdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-write-status-title"
    >
      <section className="studioRecipeQualityStatus" aria-live="polite">
        <span
          className={[
            "studioRecipeQualityStatusIcon",
            success ? "studioRecipeQualityStatusIcon--success" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <SystemIcon name={success ? "followed" : "loading"} size={28} />
        </span>
        <p>{success ? "WRITE COMPLETE" : "WRITING RECIPE"}</p>
        <h2 id="recipe-write-status-title">
          {success ? `${recipe.title} 已写入 ${slot}` : `正在写入 ${slot}`}
        </h2>
        <span>
          {success
            ? "相机槽位已经更新，可以立即开始拍摄。"
            : "请保持相机连接，不要关闭应用。"}
        </span>
        {!success ? (
          <div
            className="studioRecipeQualityProgress"
            role="progressbar"
            aria-label="写入进度"
            aria-valuetext="正在写入"
          >
            <span />
          </div>
        ) : null}
        <button
          type="button"
          className={`kitButton kitButton--height48 ${
            success ? "kitButton--primary" : "kitButton--neutral-outline"
          }`}
          onClick={success ? onDone : onCancel}
        >
          {success ? "完成" : "取消写入"}
        </button>
      </section>
    </div>
  );
}

function FujiStyleHome({
  searchActive,
  searchQuery,
  onSearchActivate,
  onSearchCancel,
  onSearchChange,
  onAction,
  onBack,
}: {
  searchActive: boolean;
  searchQuery: string;
  onSearchActivate: () => void;
  onSearchCancel: () => void;
  onSearchChange: (value: string) => void;
  onAction: (message: string) => void;
  onBack?: () => void;
}) {
  const [nav, setNav] = useState("community");

  return (
    <>
      <PrimaryNavigation
        className="prototypeFeedNavigation studioRecipeCommunityNav"
        items={[
          { key: "community", label: "配方社区" },
          { key: "groups", label: "配方组" },
        ]}
        value={nav}
        onChange={setNav}
        actions={[
          {
            key: "search",
            label: "搜索配方",
            icon: <PrimaryNavigationSearchIcon />,
            onPress: onSearchActivate,
          },
        ]}
        onAction={(key) => {
          if (key === "search") onSearchActivate();
        }}
      />
      {searchActive ? (
        <div className="studioRecipeCommunitySearchSlot">
          <SearchControl
            value={searchQuery}
            active
            placeholder="搜索配方、作者、胶片模拟"
            ariaLabel="搜索配方社区"
            onActivate={onSearchActivate}
            onChange={onSearchChange}
            onCancel={onSearchCancel}
            onSubmit={(value) => onAction(`搜索「${value}」`)}
          />
        </div>
      ) : null}
      <main className="prototypeDestinationScroll studioRecipeCommunityScroll">
        <section className="studioRecipeCommunityHero" aria-label="编辑推荐">
          <Image
            src={SAMPLE_PHOTOS[0]}
            alt=""
            width={343}
            height={200}
            className="studioRecipeCommunityHeroMedia"
          />
          <div className="studioRecipeCommunityHeroMeta">
            <span className="studioRecipeCommunityFilmPill">Classic Neg</span>
            <strong>盛夏巴黎</strong>
            <span className="studioRecipeCommunityHeroStat">
              <SystemIcon name="like" size={16} />
              1.3k
            </span>
          </div>
          <button
            type="button"
            className="kitButton kitButton--height32 kitButton--primary studioRecipeCommunityHeroCta"
            onClick={() => onAction("已收藏配方")}
          >
            存配方
          </button>
        </section>

        <section
          className="studioRecipeCommunityChipRow"
          aria-label="场景筛选"
        >
          {["热门", "人像", "风景", "夜景"].map((chip, index) => (
            <button
              key={chip}
              type="button"
              className={[
                "studioRecipeCommunityChip",
                index === 0 ? "studioRecipeCommunityChip--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onAction(`筛选：${chip}`)}
            >
              {chip}
            </button>
          ))}
        </section>

        <section aria-labelledby="fujistyle-groups-title">
          <div className="studioRecipeCommunitySectionHead">
            <h3 id="fujistyle-groups-title">热门配方组</h3>
            <button type="button" onClick={() => onAction("打开配方组列表")}>
              更多
            </button>
          </div>
          <div className="studioRecipeCommunityGroupRail">
            {["山川风景", "街头纪实", "当前相机"].map((name, index) => (
              <article key={name} className="studioRecipeCommunityGroupCard">
                <Image
                  src={SAMPLE_PHOTOS[index % 2]}
                  alt=""
                  width={120}
                  height={120}
                />
                <strong>{name}</strong>
                <span>{index === 2 ? "7 配方 · 已同步" : "12 配方"}</span>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="fujistyle-feed-title">
          <h3 id="fujistyle-feed-title" className="visuallyHidden">
            推荐流
          </h3>
          <div className="studioRecipeCommunityMasonry">
            {MOCK_RECIPES.map((recipe, index) => (
              <article
                key={recipe.id}
                className="studioRecipeCommunityMasonryCard"
              >
                <Image
                  src={SAMPLE_PHOTOS[index % 2]}
                  alt=""
                  width={168}
                  height={index === 0 ? 220 : 180}
                />
                <RecipeImportBadge count={recipe.imports} />
                <div className="studioRecipeCommunityMasonryOverlay">
                  <span className="studioRecipeCommunityFilmPill">
                    {recipe.filmSim}
                  </span>
                  <p>{recipe.title}</p>
                  <div className="studioRecipeCommunityMasonryMeta">
                    <span>{recipe.author}</span>
                    <span aria-label={`${recipe.likes} 赞`}>
                      <SystemIcon name="like" size={14} />
                      {recipe.likes}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="studioRecipeCommunityMasonrySave"
                  aria-label={`收藏 ${recipe.title}`}
                  onClick={() => onAction(`已收藏：${recipe.title}`)}
                >
                  <SystemIcon name="add" size={18} />
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
      {onBack ? (
        <button
          type="button"
          className="visuallyHidden"
          onClick={onBack}
          aria-hidden="true"
        >
          返回
        </button>
      ) : null}
    </>
  );
}

function FujiRecipesHome({
  tab,
  onTabChange,
  searchActive,
  searchQuery,
  onSearchActivate,
  onSearchCancel,
  onSearchChange,
  onAction,
}: {
  tab: "discover" | "saved";
  onTabChange: (tab: "discover" | "saved") => void;
  searchActive: boolean;
  searchQuery: string;
  onSearchActivate: () => void;
  onSearchCancel: () => void;
  onSearchChange: (value: string) => void;
  onAction: (message: string) => void;
}) {
  const [filter, setFilter] = useState("all");

  return (
    <>
      <header className="studioRecipeCommunityWorkbenchBar">
        <button
          type="button"
          className="studioRecipeCommunityCameraPill"
          onClick={() => onAction("打开相机连接")}
        >
          <span className="studioRecipeCommunityCameraDot" aria-hidden="true" />
          X100VI · 已连接
        </button>
        <button
          type="button"
          className="studioRecipeCommunitySyncBtn"
          onClick={() => onAction("同步 12 条配方到机身")}
        >
          已同步 12
        </button>
      </header>

      <div className="studioRecipeCommunitySearchSlot">
        <SearchControl
          value={searchQuery}
          active={searchActive}
          placeholder="胶片模拟、作者、标签"
          ariaLabel="搜索配方库"
          autoFocus={false}
          onActivate={onSearchActivate}
          onChange={onSearchChange}
          onCancel={onSearchCancel}
          onSubmit={(value) => onAction(`搜索「${value}」`)}
        />
      </div>

      <PillSecondaryTab
        className="studioRecipeCommunityFilterTabs"
        ariaLabel="配方筛选"
        items={[
          { key: "all", label: "全部" },
          { key: "sensor", label: "X-Trans V" },
          { key: "sim", label: "Classic Neg" },
          { key: "scene", label: "人像" },
        ]}
        value={filter}
        onChange={setFilter}
      />

      <UnderlineSecondaryTab
        className="studioRecipeCommunitySortTabs"
        ariaLabel="发现与收藏"
        items={[
          { key: "discover", label: "发现" },
          { key: "saved", label: "收藏" },
        ]}
        value={tab}
        onChange={(key) => onTabChange(key as "discover" | "saved")}
      />

      <main className="prototypeDestinationScroll studioRecipeCommunityScroll">
        <section aria-labelledby="workbench-slots-title">
          <div className="studioRecipeCommunitySectionHead">
            <h3 id="workbench-slots-title">我的相机槽位</h3>
            <button type="button" onClick={() => onAction("管理槽位")}>
              编辑
            </button>
          </div>
          <div className="studioRecipeCommunitySlotRow">
            {["C1", "C2", "C3"].map((slot, index) => (
              <div key={slot} className="studioRecipeCommunitySlot">
                <span>{slot}</span>
                <strong>
                  {index === 0 ? "Classic Neg" : index === 1 ? "空" : "CC 人像"}
                </strong>
              </div>
            ))}
          </div>
        </section>

        <ul className="studioRecipeCommunityRecipeList" aria-label="配方列表">
          {MOCK_RECIPES.map((recipe) => (
            <li key={recipe.id}>
              <article className="studioRecipeCommunityRecipeRow">
                <div className="studioRecipeCommunityRecipeThumbWrap">
                  <Image
                    src={SAMPLE_PHOTOS[0]}
                    alt=""
                    width={72}
                    height={72}
                    className="studioRecipeCommunityRecipeThumb"
                  />
                  <RecipeImportBadge
                    count={recipe.imports}
                    compact
                    className="studioRecipeImportBadge--onThumb"
                  />
                </div>
                <div className="studioRecipeCommunityRecipeBody">
                  <div className="studioRecipeCommunityRecipeTitleRow">
                    <strong>{recipe.filmSim}</strong>
                    {recipe.verified ? (
                      <span className="studioRecipeCommunityVerified">官方</span>
                    ) : null}
                  </div>
                  <p className="studioRecipeCommunityRecipeShorthand">
                    {recipe.shorthand}
                  </p>
                  <p className="studioRecipeCommunityRecipeMeta">
                    {recipe.camera} ·{" "}
                    <span className="studioRecipeImportMetaHighlight">
                      {recipe.imports} 次导入
                    </span>
                    {" · "}
                    {recipe.saves} 收藏
                  </p>
                </div>
                <button
                  type="button"
                  className="kitButton kitButton--height32 kitButton--primary studioRecipeCommunityRowCta"
                  onClick={() => onAction(`写入相机：${recipe.filmSim}`)}
                >
                  写入
                </button>
              </article>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

function RecipeRoomHome({
  mode,
  onModeChange,
  searchActive,
  searchQuery,
  onSearchActivate,
  onSearchCancel,
  onSearchChange,
  onAction,
  onBack,
}: {
  mode: RecipeRoomMode;
  onModeChange: (mode: RecipeRoomMode) => void;
  searchActive: boolean;
  searchQuery: string;
  onSearchActivate: () => void;
  onSearchCancel: () => void;
  onSearchChange: (value: string) => void;
  onAction: (message: string) => void;
  onBack?: () => void;
}) {
  return (
    <>
      <RegularNavigation
        title="发现"
        leading="none"
        trailing={
          <button
            type="button"
            aria-label="搜索"
            className="studioRecipeCommunityNavIconBtn"
            onClick={onSearchActivate}
          >
            <SystemIcon name="search" size={24} />
          </button>
        }
        onBack={onBack}
      />
      {searchActive ? (
        <div className="studioRecipeCommunitySearchSlot">
          <SearchControl
            value={searchQuery}
            active
            placeholder={mode === "post" ? "搜索作品" : "搜索配方参数"}
            ariaLabel="搜索"
            onActivate={onSearchActivate}
            onChange={onSearchChange}
            onCancel={onSearchCancel}
            onSubmit={(value) => onAction(`搜索「${value}」`)}
          />
        </div>
      ) : null}

      <TextSecondaryTab
        className="studioRecipeCommunityDualTabs"
        ariaLabel="作品与配方"
        items={[
          { key: "post", label: "作品 Post" },
          { key: "recipe", label: "配方 Recipe" },
        ]}
        value={mode}
        onChange={(key) => onModeChange(key as RecipeRoomMode)}
      />

      {mode === "post" ? (
        <PillSecondaryTab
          className="studioRecipeCommunityFilterTabs"
          ariaLabel="作品筛选"
          items={[
            { key: "near", label: "附近" },
            { key: "portrait", label: "人像" },
            { key: "street", label: "街头" },
          ]}
          value="near"
          onChange={() => undefined}
        />
      ) : (
        <PillSecondaryTab
          className="studioRecipeCommunityFilterTabs"
          ariaLabel="配方筛选"
          items={[
            { key: "sim", label: "胶片模拟" },
            { key: "body", label: "X100VI" },
            { key: "mood", label: "复古" },
          ]}
          value="sim"
          onChange={() => undefined}
        />
      )}

      <main className="prototypeDestinationScroll studioRecipeCommunityScroll">
        {mode === "post" ? (
          <div className="studioRecipeCommunityPostGrid" aria-label="作品网格">
            {MOCK_RECIPES.map((recipe, index) => (
              <article key={recipe.id} className="studioRecipeCommunityPostCell">
                <Image
                  src={SAMPLE_PHOTOS[index % 2]}
                  alt=""
                  width={168}
                  height={168}
                />
                <button
                  type="button"
                  className="studioRecipeCommunityAnalyseBtn"
                  onClick={() => onAction(`分析作品参数：${recipe.title}`)}
                >
                  分析配方
                </button>
              </article>
            ))}
          </div>
        ) : (
          <ul className="studioRecipeCommunityRecipeList" aria-label="配方列表">
            {MOCK_RECIPES.map((recipe) => (
              <li key={recipe.id}>
                <article className="studioRecipeCommunityRecipeRoomCard">
                  <header className="studioRecipeCommunityRecipeRoomHeader">
                    <div>
                      <strong>{recipe.title}</strong>
                      <span className="studioRecipeCommunityFilmPill">
                        {recipe.filmSim}
                      </span>
                    </div>
                    <RecipeImportBadge
                      count={recipe.imports}
                      compact
                      className="studioRecipeImportBadge--inline"
                    />
                  </header>
                  <dl className="studioRecipeCommunityParamGrid">
                    <div>
                      <dt>动态范围</dt>
                      <dd>DR400</dd>
                    </div>
                    <div>
                      <dt>颗粒</dt>
                      <dd>弱</dd>
                    </div>
                    <div>
                      <dt>色彩</dt>
                      <dd>+2</dd>
                    </div>
                    <div>
                      <dt>机型</dt>
                      <dd>{recipe.camera}</dd>
                    </div>
                  </dl>
                  <div className="studioRecipeCommunityRecipeRoomActions">
                    <button
                      type="button"
                      className="kitButton kitButton--height32 kitButton--neutral-outline"
                      onClick={() => onAction("打开参数对比")}
                    >
                      对比
                    </button>
                    <button
                      type="button"
                      className="kitButton kitButton--height32 kitButton--primary"
                      onClick={() => onAction(`应用配方：${recipe.filmSim}`)}
                    >
                      应用配方
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

function RecipeImportBadge({
  count,
  compact = false,
  className,
}: {
  count: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={[
        "studioRecipeImportBadge",
        compact ? "studioRecipeImportBadge--compact" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`${count} 次导入`}
    >
      <strong>{count}</strong>
      <span>导入</span>
    </span>
  );
}

function FilmsimRecipesHome({
  sortTab,
  onSortChange,
  searchActive,
  searchQuery,
  onSearchActivate,
  onSearchCancel,
  onSearchChange,
  onAction,
}: {
  sortTab: FilmsimSortTab;
  onSortChange: (tab: FilmsimSortTab) => void;
  searchActive: boolean;
  searchQuery: string;
  onSearchActivate: () => void;
  onSearchCancel: () => void;
  onSearchChange: (value: string) => void;
  onAction: (message: string) => void;
}) {
  const sortItems = [
    { key: "hot", label: "热门" },
    { key: "latest", label: "最新" },
    { key: "az", label: "A-Z" },
  ] as const;

  return (
    <>
      <header className="studioRecipeFilmsimHeader">
        <h1 className="studioRecipeFilmsimBrand">FILMSIMRECIPES.</h1>
        <div className="studioRecipeFilmsimHeaderActions">
          <button
            type="button"
            className="studioRecipeFilmsimIconBtn"
            aria-label="通知"
            onClick={() => onAction("打开通知")}
          >
            <SystemIcon name="notification" size={24} />
          </button>
          <button
            type="button"
            className="studioRecipeFilmsimAvatarBtn"
            aria-label="个人资料"
            onClick={() => onAction("打开个人资料")}
          >
            <AvatarVisual
              src="/prototypes/feed/latifa-avatar.png"
              alt=""
              size={32}
            />
          </button>
        </div>
      </header>

      <div className="studioRecipeCommunitySearchSlot studioRecipeFilmsimSearch">
        <SearchControl
          value={searchQuery}
          active={searchActive}
          placeholder="搜索配方、风格、创作者"
          ariaLabel="搜索配方"
          autoFocus={false}
          onActivate={onSearchActivate}
          onChange={onSearchChange}
          onCancel={onSearchCancel}
          onSubmit={(value) => onAction(`搜索「${value}」`)}
        />
      </div>

      <button
        type="button"
        className="studioRecipeFilmsimProBanner"
        aria-label="查看 Pro 配方"
        onClick={() => onAction("打开 Pro 配方订阅")}
      >
        <div className="studioRecipeFilmsimProThumbs" aria-hidden="true">
          <Image src={SAMPLE_PHOTOS[0]} alt="" width={40} height={40} />
          <Image src={SAMPLE_PHOTOS[0]} alt="" width={40} height={40} />
        </div>
        <div className="studioRecipeFilmsimProCopy">
          <span className="studioRecipeFilmsimProTitle">
            Pro 配方
            <span className="studioRecipeFilmsimProBadge">PRO</span>
          </span>
          <span className="studioRecipeFilmsimProSub">6 个独家配方</span>
        </div>
        <SystemIcon name="chevronRight" size={20} />
      </button>

      <div
        className="studioRecipeCommunityChipRow studioRecipeFilmsimFilterRow"
        aria-label="配方筛选"
      >
        {FILMSIM_FILTERS.map((label, index) => (
          <button
            key={label}
            type="button"
            className={[
              "studioRecipeFilmsimFilterChip",
              index === 0 ? "studioRecipeFilmsimFilterChip--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onAction(`筛选：${label}`)}
          >
            {label}
            {index > 0 ? <SystemIcon name="chevronDown" size={14} /> : null}
          </button>
        ))}
      </div>

      <div className="studioRecipeFilmsimListMeta">
        <p className="studioRecipeFilmsimCount">153 个配方</p>
        <TextSecondaryTab
          className="studioRecipeFilmsimSortTabs"
          ariaLabel="排序"
          items={sortItems}
          value={sortTab}
          onChange={(key) => onSortChange(key as FilmsimSortTab)}
          capitalizeInactive={false}
        />
      </div>

      <main
        className="prototypeDestinationScroll studioRecipeFilmsimScroll"
        aria-label="配方双列网格"
      >
        <div className="studioRecipeFilmsimGrid">
          {FILMSIM_GRID.map((item) => (
            <article key={item.id} className="studioRecipeFilmsimCard">
              <button
                type="button"
                className="studioRecipeFilmsimCardMedia"
                aria-label={`打开配方 ${item.title}`}
                onClick={() => onAction(`打开配方：${item.title}`)}
              >
                <Image src={item.media} alt="" width={168} height={200} />
                <span className="studioRecipeFilmsimCardLikes" aria-hidden="true">
                  <SystemIcon name="like" size={14} />
                  {item.likes}
                </span>
                <RecipeImportBadge count={item.imports} />
              </button>
              <div className="studioRecipeFilmsimCardBody">
                <strong>{item.title}</strong>
                <span className="studioRecipeFilmsimCardSim">{item.filmSim}</span>
                <p className="studioRecipeFilmsimCardAuthor">
                  {item.author}
                  {item.verified ? (
                    <span
                      className="studioRecipeFilmsimVerified"
                      aria-label="已认证创作者"
                    />
                  ) : null}
                </p>
              </div>
            </article>
          ))}
        </div>
      </main>

      <nav className="studioRecipeFilmsimTabBar" aria-label="应用主导航">
        <button type="button" onClick={() => onAction("首页")}>
          <SystemIcon name="globe" size={24} />
          <span>首页</span>
        </button>
        <button
          type="button"
          className="studioRecipeFilmsimTabBarItem--active"
          aria-current="page"
        >
          <SystemIcon name="photo" size={24} />
          <span>配方</span>
        </button>
        <button
          type="button"
          className="studioRecipeFilmsimCameraFab"
          aria-label="打开相机"
          onClick={() => onAction("打开相机拍摄")}
        >
          <SystemIcon name="addCircle" size={26} />
        </button>
        <button type="button" onClick={() => onAction("社区")}>
          <SystemIcon name="contacts" size={24} />
          <span>社区</span>
        </button>
        <button type="button" onClick={() => onAction("库")}>
          <SystemIcon name="history" size={24} />
          <span>库</span>
        </button>
      </nav>
    </>
  );
}
