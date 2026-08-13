import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { ComponentPreview } from "@/components/component-preview";
import { ContentDocument } from "@/components/content-document";
import {
  CoveragePill,
} from "@/components/spec-badges";
import {
  getCatalog,
  getComponent,
  getComponentContent,
  getComponentCoverage,
} from "@/lib/catalog";

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.components.map((component) => ({ id: component.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const component = await getComponent(id);
  return {
    title: component?.title ?? "组件",
    description: component?.description,
  };
}

export default async function ComponentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [component, catalog, content] = await Promise.all([
    getComponent(id),
    getCatalog(),
    getComponentContent(id),
  ]);
  if (!component) notFound();

  const coverage = await getComponentCoverage(component);
  const mappings = catalog.platformMappings.filter(
    (mapping) =>
      component.platformMappingIds?.includes(mapping.id) ||
      mapping.componentId === component.id,
  );
  const interactions = catalog.interactions.filter(
    (interaction) =>
      component.interactionIds?.includes(interaction.id) ||
      interaction.componentIds?.includes(component.id),
  );
  const tokenMap = new Map(
    catalog.foundations.flatMap((foundation) =>
      foundation.tokens.map((token) => [token.id, token] as const),
    ),
  );
  const sync = catalog.figmaSync[component.id];

  return (
    <article className="editorialComponentPage">
      <div className="editorialSpecs">
        <div className="stageTopline specTopline">
          <Breadcrumb
            items={[
              { label: "组件目录", href: "/components" },
              { label: component.category ?? component.title },
            ]}
          />
          <span className="stageIndex">DS—01</span>
        </div>
        <h1 id="component-title" className="visuallyHidden">
          {component.title}
        </h1>
        <nav className="specAnchorNav" aria-label="组件详情章节">
          <a href="#overview">概览</a>
          <a href="#playground">实时预览</a>
          <a href="#anatomy">结构</a>
          <a href="#interaction">交互</a>
          <a href="#contract">契约</a>
          <a href="#delivery">实现与验收</a>
        </nav>

        <section id="overview" className="editorialSpecSection">
          <EditorialSectionHeader
            index="01"
            eyebrow="Overview"
            title={component.title}
          />
          <div className="overviewLead">
            <p>{component.description}</p>
          </div>
          <div className="contractFacts">
            <div>
              <span>OWNER</span>
              <strong>{component.owner ?? "未指定"}</strong>
            </div>
            <div>
              <span>VERSION</span>
              <strong>{component.version}</strong>
            </div>
            <div>
              <span>FIGMA NODE</span>
              <strong>{component.reference?.nodeId ?? "未绑定"}</strong>
            </div>
            <div>
              <span>LAST SYNC</span>
              <strong>
                {sync
                  ? new Date(sync.syncedAt).toLocaleDateString("zh-CN")
                  : "尚未同步"}
              </strong>
            </div>
          </div>
          <div className="coverageLedger">
            <span>说明文档</span>
            <CoveragePill ready={coverage.documentation}>
              {coverage.documentation ? "已覆盖" : "待补充"}
            </CoveragePill>
            <span>React 参考</span>
            <CoveragePill ready={coverage.reactPreview}>
              {coverage.reactPreview ? "已覆盖" : "待补充"}
            </CoveragePill>
            <span>iOS 自动验收</span>
            <CoveragePill ready={coverage.iosAudit}>
              {coverage.iosAudit ? "可执行" : "未接入"}
            </CoveragePill>
          </div>
          {content && (
            <div className="editorialProse">
              <ContentDocument source={content} />
            </div>
          )}
        </section>

        <section id="playground" className="editorialSpecSection">
          <EditorialSectionHeader
            index="02"
            eyebrow="Playground"
            title="用真实内容验证组件行为"
          />
          <p className="sectionLead">
            修改文案和计数，点击标签或直接滑动内容列表。预览状态与组件的无障碍语义同步更新。
          </p>
          <ComponentPreview component={component} />
        </section>

        <section id="anatomy" className="editorialSpecSection">
          <EditorialSectionHeader
            index="03"
            eyebrow="Anatomy"
            title="组件由什么构成"
          />
          <div className="editorialAnatomy">
            {(component.anatomy ?? []).map((item, index) => (
              <div className="editorialAnatomyItem" key={item.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.description}</p>
                </div>
                <code>{item.id}</code>
              </div>
            ))}
          </div>
        </section>

        <section id="interaction" className="editorialSpecSection">
          <EditorialSectionHeader
            index="04"
            eyebrow="Interaction"
            title="状态与手势如何流动"
          />
          {interactions.map((interaction) => (
            <div className="interactionEditorial" key={interaction.id}>
              <div className="interactionSummary">
                <div>
                  <strong>{interaction.title}</strong>
                  <p>{interaction.description}</p>
                </div>
                <Link
                  className="editorialLink"
                  href={`/interactions/${interaction.id}`}
                >
                  查看交互规范
                </Link>
              </div>
              <div className="stateFlow">
                {interaction.states.map((state, index) => (
                  <span key={state} className="stateFlowGroup">
                    {index > 0 && <span className="stateArrow">→</span>}
                    <span className="stateNode">{state}</span>
                  </span>
                ))}
              </div>
              <div className="transitionLedger">
                {interaction.transitions.map((transition, index) => (
                  <div key={`${transition.from}-${transition.to}-${index}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{transition.trigger}</strong>
                      <p>{transition.feedback}</p>
                    </div>
                    <code>{transition.duration}ms</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="accessibilityNote">
            <span>A11Y</span>
            <ul>
              {(component.accessibility ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contract" className="editorialSpecSection">
          <EditorialSectionHeader
            index="05"
            eyebrow="Contract"
            title="变体、属性与 Token"
          />
          <h3 className="subsectionTitle">Variants</h3>
          <div className="specTableScroll">
            <table className="specTable">
              <thead>
                <tr>
                  <th>属性</th>
                  <th>可选值</th>
                  <th>默认值</th>
                </tr>
              </thead>
              <tbody>
                {(component.variants ?? []).map((variant) => (
                  <tr key={variant.name}>
                    <td><code>{variant.name}</code></td>
                    <td>{variant.values.join(" / ")}</td>
                    <td>{variant.defaultValue ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="subsectionTitle">Component Props</h3>
          <div className="specTableScroll">
            <table className="specTable">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>类型</th>
                  <th>必填</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                {(component.props ?? []).map((prop) => (
                  <tr key={prop.name}>
                    <td><code>{prop.name}</code></td>
                    <td><code>{prop.type}</code></td>
                    <td>{prop.required ? "是" : "否"}</td>
                    <td>{prop.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="subsectionTitle">Token 依赖</h3>
          <div className="editorialTokenList">
            {(component.tokenRefs ?? []).map((tokenId) => {
              const token = tokenMap.get(tokenId);
              return (
                <div key={tokenId}>
                  {tokenId.startsWith("color.") && token ? (
                    <span
                      className="tokenDot"
                      style={{ background: String(token.value) }}
                    />
                  ) : (
                    <span className="tokenDot tokenDotType">T</span>
                  )}
                  <strong>{token?.name ?? tokenId}</strong>
                  <code>{tokenId}</code>
                  <code>{token ? String(token.value) : "尚未定义"}</code>
                </div>
              );
            })}
          </div>
        </section>

        <section id="delivery" className="editorialSpecSection">
          <EditorialSectionHeader
            index="06"
            eyebrow="Delivery"
            title="多端实现与自动验收"
          />
          <div className="mappingList editorialMappingList">
            {mappings.flatMap((mapping) =>
              Object.entries(mapping.platforms).map(
                ([platform, detail]) =>
                  detail && (
                    <div className="mappingItem" key={platform}>
                      <span className="platformBadge">
                        {platform === "h5" ? "Web" : platform}
                      </span>
                      <div>
                        <div className="cardTopline">
                          <strong>{detail.componentName}</strong>
                          <CoveragePill ready={detail.status === "ready"}>
                            {detail.status}
                          </CoveragePill>
                        </div>
                        <p>{detail.package}</p>
                        <code className="codeBlock">{detail.codeExample}</code>
                      </div>
                    </div>
                  ),
              ),
            )}
          </div>

          <div className="auditSectionHeader">
            <div>
              <h3 className="subsectionTitle">组件验收白名单</h3>
              <p>同一规则影响多个 Tab 时聚合为一条问题，避免节点级噪音。</p>
            </div>
            <strong>{component.rules.length} RULES</strong>
          </div>
          <div className="ruleList editorialRuleList">
            {component.rules.map((rule, index) => (
              <div className="ruleItem" key={rule.id}>
                <span className="ruleIndex">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <strong>{rule.title}</strong>
                  <p>
                    {rule.metric} · 容差 {rule.tolerance}
                    {rule.metric.toLowerCase().includes("color")
                      ? " channel"
                      : "pt"}
                  </p>
                  <code className="inlineCode">{rule.id}</code>
                </div>
                <span className="ruleCategory">{rule.category}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="editorialFooter">
          <span>TopTop Design System</span>
          <span>{component.id} / v{component.version}</span>
        </footer>
      </div>
    </article>
  );
}

function EditorialSectionHeader({
  index,
  eyebrow,
  title,
}: {
  index: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <header className="editorialSectionHeader">
      <span>{index}</span>
      <div>
        <p>{eyebrow}</p>
        <h2>{title}</h2>
      </div>
    </header>
  );
}
