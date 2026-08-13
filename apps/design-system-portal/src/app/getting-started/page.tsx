import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agent 协作入门",
  description:
    "使用 TopTop Kit、本地 Cursor Agent 与验收 Skills 搭建功能原型。",
};

const layers = [
  {
    label: "L1 · Kit 与设计表达",
    audience: "设计师 / 产品",
    description:
      "Portal 展示设计原则、Foundations、组件、交互和参考预览，回答“为什么这样设计、长什么样、哪些不可变”。",
    links: [
      { href: "/principles", label: "设计原则" },
      { href: "/foundations", label: "视觉基础" },
      { href: "/components", label: "组件目录" },
    ],
  },
  {
    label: "L2 · Agent 可执行标准",
    audience: "本地 AI Agent",
    description:
      "YAML 契约、Catalog API 和 MDX 指导 Agent 选择真实组件、Token 与状态。",
    links: [
      { href: "/api/catalog", label: "Catalog API" },
      { href: "/interactions", label: "交互规范" },
    ],
  },
  {
    label: "L3 · 原型与验收",
    audience: "研发 / 审查者",
    description:
      "Cursor 在本地代码库中搭建原型，Skills 检查视觉、设计、逻辑和像素还原。",
    links: [
      { href: "/canvas", label: "原型预览" },
      { href: "/governance", label: "体系治理" },
    ],
  },
];

const recipes = [
  {
    title: "从产品描述搭建功能原型",
    skill: "toptop-prototype-studio",
    steps: [
      "在 Cursor 打开目标项目并描述主要任务、平台和页面范围。",
      "让 Agent 选择 Kit Strict、Hybrid 或 Exploratory 模式。",
      "用 Kit 组件做锚点，以基础原语和 Prototype 模块补齐缺口。",
      "运行项目测试，再进入综合验收。",
    ],
  },
  {
    title: "从截图映射到 Kit",
    skill: "page-canvas-vision + toptop-prototype-studio",
    steps: [
      "把截图作为 Cursor 附件，要求 Agent 直接看图。",
      "输出组件映射、无法入库区域和必要的原图 bbox。",
      "使用真实组件实现，不把未知区域伪装成相似组件。",
      "需要切图和像素验收时追加 yueban-image-to-code。",
    ],
  },
  {
    title: "审查已完成原型",
    skill: "toptop-design-review",
    steps: [
      "提供用户目标、实现文件、运行截图和组件栈。",
      "先检查主要任务，再检查 Kit、视觉层级和交互状态。",
      "按需追加 Monkren 五维、AI slop 或交互状态专项审查。",
      "输出带 spec/file 证据的 P0/P1/P2 与可交付结论。",
    ],
  },
];

export default function GettingStartedPage() {
  return (
    <>
      <header className="pageHeader">
        <div>
          <p className="eyebrow">AGENT WORKFLOW</p>
          <h1 className="pageTitle">Kit 在云上，大脑在本地 Agent</h1>
          <p className="pageDescription">
            Portal 可以部署到外网，为人和 Agent 提供同一套组件、Token、交互和参考实现；推理与代码修改由用户自己的
            Cursor 完成。
          </p>
        </div>
        <div className="headerActions">
          <Link className="button buttonPrimary" href="/components">
            浏览 Kit
          </Link>
          <Link className="button buttonSecondary" href="/canvas">
            打开原型预览
          </Link>
        </div>
      </header>

      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2 className="sectionTitle">三层协作模型</h2>
            <p className="sectionDescription">
              设计表达、Agent 标准和交付工作流各自只有一个职责
            </p>
          </div>
        </div>
        <div className="componentGrid">
          {layers.map((layer) => (
            <article className="contentCard" key={layer.label}>
              <p className="eyebrow">{layer.audience}</p>
              <h3 className="cardTitle">{layer.label}</h3>
              <p className="cardDescription">{layer.description}</p>
              <div className="buttonRow">
                {layer.links.map((link) => (
                  <Link className="textLink" href={link.href} key={link.href}>
                    {link.label} →
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section twoColumn">
        <div className="contentCard">
          <h2>推荐主路径</h2>
          <div className="stateFlow">
            {[
              "对齐原则",
              "查看 Kit",
              "Cursor 搭建",
              "Skills 验收",
              "迭代审计",
            ].map((step, index) => (
              <span key={step} style={{ display: "contents" }}>
                {index > 0 && <span className="stateArrow">→</span>}
                <span className="stateNode">{step}</span>
              </span>
            ))}
          </div>
          <p>
            默认直接在 Cursor 和目标代码库中实现。完成后的真实页面路由登记到原型预览，
            Portal 不要求用户先在网页里手工拼页面。
          </p>
        </div>

        <div className="contentCard">
          <h2>本地开始</h2>
          <code className="codeBlock">
            npm run portal:dev{"\n"}
            npm run specs:validate{"\n"}
            npm run verify:mvp
          </code>
          <p>
            在 Cursor 中先调用 <code>toptop-design-bundle</code>{" "}
            查看路由，再按任务进入实现或审查 Skill。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2 className="sectionTitle">Skill 组合菜谱</h2>
            <p className="sectionDescription">
              先用最小能力完成任务，需要时再追加专项审查
            </p>
          </div>
        </div>
        <div className="componentGrid">
          {recipes.map((recipe) => (
            <article className="contentCard" key={recipe.title}>
              <h3 className="cardTitle">{recipe.title}</h3>
              <code>{recipe.skill}</code>
              <ol>
                {recipe.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="section twoColumn">
        <div className="contentCard">
          <h2>H5 验收</h2>
          <p>
            使用浏览器语义、Playwright、截图和视觉 diff。检查响应式、键盘、可访问性及
            Kit 还原。
          </p>
        </div>
        <div className="contentCard">
          <h2>iOS 验收</h2>
          <p>
            Lookin 获取运行时层级与 Kit Profile，配合通用 Frame 审计；与原则审查、叠图一并使用，见{" "}
            <Link className="textLink" href="/audit">
              验收中心
            </Link>
            。
          </p>
        </div>
      </section>
    </>
  );
}
