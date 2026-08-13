import type { Metadata } from "next";
import Link from "next/link";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "设计原则",
  description: "清晰简单、一致规律、包容开放：TopTop Kit 的设计决策基线。",
};

export default async function PrinciplesPage() {
  const catalog = await getCatalog();
  const spec = catalog.principles.find(
    (item) => item.id === "core-design-principles",
  );

  if (!spec) {
    return (
      <section className="contentCard">
        <h1>设计原则尚未发布</h1>
        <p>请先补充并验证核心设计原则契约。</p>
      </section>
    );
  }

  const orderedPrinciples = spec.decisionOrder.flatMap((id) => {
    const principle = spec.principles.find((item) => item.id === id);
    return principle ? [principle] : [];
  });

  return (
    <>
      <header className="pageHeader">
        <div>
          <p className="eyebrow">DESIGN PRINCIPLES</p>
          <h1 className="pageTitle">先做清晰，再求一致，最后开放扩展</h1>
          <p className="pageDescription">{spec.description}</p>
        </div>
        <div className="headerActions">
          <a
            className="button buttonSecondary"
            href={spec.source.url}
            target="_blank"
            rel="noreferrer"
          >
            查看来源
          </a>
        </div>
      </header>

      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2 className="sectionTitle">设计决策顺序</h2>
            <p className="sectionDescription">
              三条原则不是并列口号；出现取舍时按顺序判断。
            </p>
          </div>
          <span className="tag">status · {spec.status}</span>
        </div>
        <div className="stateFlow">
          {orderedPrinciples.map((principle, index) => (
            <span key={principle.id} style={{ display: "contents" }}>
              {index > 0 && <span className="stateArrow">→</span>}
              <a className="stateNode" href={`#${principle.id}`}>
                {index + 1}. {principle.title}
              </a>
            </span>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="componentGrid">
          {orderedPrinciples.map((principle, index) => (
            <article className="contentCard" id={principle.id} key={principle.id}>
              <p className="eyebrow">PRINCIPLE {index + 1}</p>
              <h2>{principle.title}</h2>
              <p>{principle.intent}</p>
              <h3>我们承诺</h3>
              <ul>
                {principle.commitments.map((commitment) => (
                  <li key={commitment}>{commitment}</li>
                ))}
              </ul>
              <h3>交付前检查</h3>
              <ul>
                {principle.checks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
              <div className="buttonRow">
                {principle.foundationRefs.map((reference) => (
                  <code key={reference}>{reference}</code>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section twoColumn">
        <article className="contentCard">
          <h2>与 Kit 的关系</h2>
          <p>
            原则回答“为什么和如何取舍”；Foundations、组件与交互契约回答“具体使用什么”。
            原则不能替代 Token，局部视觉值也不能推翻原则。
          </p>
          <div className="buttonRow">
            <Link className="textLink" href="/foundations">
              查看视觉基础 →
            </Link>
            <Link className="textLink" href="/components">
              查看组件 →
            </Link>
          </div>
        </article>
        <article className="contentCard">
          <h2>与原型工作流的关系</h2>
          <p>
            共性能力优先复用稳定 Kit；差异场景通过受控 Variant 或 Hybrid
            Prototype 探索。验证后的重复模式再进入组件生命周期。
          </p>
          <div className="buttonRow">
            <Link className="textLink" href="/getting-started">
              查看 Agent 协作 →
            </Link>
            <Link className="textLink" href="/governance">
              查看体系治理 →
            </Link>
          </div>
        </article>
      </section>
    </>
  );
}
