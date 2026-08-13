import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { ContentDocument } from "@/components/content-document";
import { StatusBadge } from "@/components/spec-badges";
import {
  getCatalog,
  getInteraction,
  getInteractionContent,
} from "@/lib/catalog";

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.interactions.map((interaction) => ({ id: interaction.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const interaction = await getInteraction(id);
  return {
    title: interaction?.title ?? "交互规范",
    description: interaction?.description,
  };
}

export default async function InteractionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [interaction, catalog, content] = await Promise.all([
    getInteraction(id),
    getCatalog(),
    getInteractionContent(id),
  ]);
  if (!interaction) notFound();

  const currentIndex = catalog.interactions.findIndex(
    (item) => item.id === interaction.id,
  );
  const previous = catalog.interactions[currentIndex - 1];
  const next = catalog.interactions[currentIndex + 1];

  return (
    <>
      <header className="pageHeader">
        <div>
          <Breadcrumb
            items={[
              { label: "交互与模式", href: "/interactions" },
              { label: interaction.id },
            ]}
          />
          <h1 className="pageTitle">{interaction.title}</h1>
          <p className="pageDescription">{interaction.description}</p>
        </div>
        <StatusBadge status={interaction.status} />
      </header>

      <article className="interactionCard">
        <div className="interactionCardBody">
          <h2 className="panelTitle">状态模型</h2>
          <div className="stateFlow" style={{ marginTop: 16 }}>
            {interaction.states.map((state, index) => (
              <span key={state} style={{ display: "contents" }}>
                {index > 0 && <span className="stateArrow">→</span>}
                <span className="stateNode">{state}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="interactionCardBody">
          <h2 className="panelTitle">关键转换</h2>
          <div className="ruleList" style={{ marginTop: 12 }}>
            {interaction.transitions.map((transition, index) => (
              <div
                className="ruleItem"
                key={`${transition.from}-${transition.to}-${transition.trigger}-${index}`}
              >
                <span className="ruleCategory">
                  {transition.duration ?? "即时"}
                </span>
                <div>
                  <strong>
                    {transition.from} → {transition.to}
                  </strong>
                  <p>{transition.trigger}</p>
                  {transition.feedback && <p>{transition.feedback}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {content && (
          <div className="interactionCardBody">
            <ContentDocument source={content} />
          </div>
        )}

        <div className="interactionCardBody twoColumn">
          <section>
            <h2 className="panelTitle">无障碍</h2>
            <ul className="interactionRequirementList">
              {(interaction.accessibility ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="panelTitle">异常与边界</h2>
            <ul className="interactionRequirementList">
              {(interaction.edgeCases ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        {(interaction.componentIds?.length ?? 0) > 0 && (
          <div className="interactionCardBody">
            <h2 className="panelTitle">关联组件</h2>
            <div className="tagList" style={{ marginTop: 10 }}>
              {interaction.componentIds?.map((componentId) => (
                <Link
                  key={componentId}
                  className="tag"
                  href={`/components/${componentId}`}
                >
                  {componentId}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <nav className="interactionPageNavigation" aria-label="交互规范翻页">
        {previous ? (
          <Link href={`/interactions/${previous.id}`}>
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/interactions/${next.id}`}>{next.title} →</Link>
        ) : (
          <span />
        )}
      </nav>
    </>
  );
}
