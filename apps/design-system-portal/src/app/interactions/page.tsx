import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/spec-badges";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "交互与模式",
};

export default async function InteractionsPage() {
  const catalog = await getCatalog();

  return (
    <>
      <header className="pageHeader">
        <div>
          <p className="eyebrow">INTERACTIONS & PATTERNS</p>
          <h1 className="pageTitle">交互与模式</h1>
          <p className="pageDescription">
            规范不止描述静态样式，也覆盖触发、状态转换、反馈、异常恢复、无障碍和多语言适配。
          </p>
        </div>
        <span className="readonlyBadge">
          {catalog.interactions.length} Patterns
        </span>
      </header>

      <div className="interactionGrid">
        {catalog.interactions.map((interaction) => (
          <article className="interactionCard" key={interaction.id}>
            <div className="interactionCardBody">
              <div className="cardTopline">
                <div>
                  <p className="eyebrow">{interaction.id}</p>
                  <h2 className="cardTitle">{interaction.title}</h2>
                </div>
                <StatusBadge status={interaction.status} />
              </div>
              <p className="cardDescription">{interaction.description}</p>
              <div className="tagList" style={{ marginTop: 16 }}>
                <span className="tag">
                  {interaction.states.length} states
                </span>
                <span className="tag">
                  {interaction.transitions.length} transitions
                </span>
              </div>
            </div>
            <div className="interactionCardBody">
              <Link
                className="textLink"
                href={`/interactions/${interaction.id}`}
              >
                查看独立规范页 →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
