import Link from "next/link";
import { ComponentCard } from "@/components/component-card";
import { Icon } from "@/components/icons";
import {
  CoverageSummary,
  StatusBadge,
} from "@/components/spec-badges";
import { getCatalog, getComponentCoverage } from "@/lib/catalog";

export default async function Home() {
  const catalog = await getCatalog();
  const principles = catalog.principles.find(
    (item) => item.id === "core-design-principles",
  );
  const coverages = await Promise.all(
    catalog.components.map(async (component) => ({
      component,
      coverage: await getComponentCoverage(component),
    })),
  );
  const tokenCount = catalog.foundations.reduce(
    (sum, foundation) => sum + foundation.tokens.length,
    0,
  );
  const iosAuditCount = coverages.filter(
    (item) => item.coverage.iosAudit,
  ).length;
  const coveragePercent =
    catalog.components.length > 0
      ? Math.round((iosAuditCount / catalog.components.length) * 100)
      : 0;

  return (
    <>
      <header className="pageHeader">
        <div>
          <p className="eyebrow">TOPTOP DESIGN SYSTEM</p>
          <h1 className="pageTitle">Kit 定义边界，Agent 搭建原型</h1>
          <p className="pageDescription">
            外网 Portal 提供组件、Token、交互规则和可操作参考，本地 Cursor
            负责搭建功能原型，Skills 继续检查视觉、设计和交互逻辑。
          </p>
        </div>
        <div className="headerActions">
          <Link className="button buttonPrimary" href="/components">
            浏览组件
          </Link>
          <Link className="button buttonSecondary" href="/governance">
            查看接入规范
          </Link>
          <Link className="button buttonSecondary" href="/getting-started">
            Agent 协作入门
          </Link>
        </div>
      </header>

      <section className="metricGrid" aria-label="体系概览">
        <MetricCard
          label="组件规范"
          value={catalog.components.length}
          hint={`${catalog.components.filter((item) => item.status === "stable").length} 个已稳定`}
          icon="component"
        />
        <MetricCard
          label="Design Tokens"
          value={tokenCount}
          hint={`${catalog.foundations.length} 个基础分类`}
          icon="foundation"
        />
        <MetricCard
          label="交互模式"
          value={catalog.interactions.length}
          hint="覆盖状态、反馈与异常路径"
          icon="interaction"
        />
        <MetricCard
          label="自动验收覆盖"
          value={`${coveragePercent}%`}
          hint={`${iosAuditCount}/${catalog.components.length} 个组件`}
          icon="audit"
        />
      </section>

      {principles && (
        <section className="section">
          <div className="sectionHeader">
            <div>
              <h2 className="sectionTitle">共同的设计判断</h2>
              <p className="sectionDescription">
                先保证任务清晰，再复用一致规律，并为真实差异保留受控扩展
              </p>
            </div>
            <Link href="/principles" className="textLink">
              查看设计原则 →
            </Link>
          </div>
          <div className="componentGrid">
            {principles.decisionOrder.flatMap((id, index) => {
              const principle = principles.principles.find(
                (item) => item.id === id,
              );
              return principle
                ? [
                    <article className="contentCard" key={principle.id}>
                      <p className="eyebrow">0{index + 1}</p>
                      <h3 className="cardTitle">{principle.title}</h3>
                      <p className="cardDescription">{principle.intent}</p>
                    </article>,
                  ]
                : [];
            })}
          </div>
        </section>
      )}

      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2 className="sectionTitle">首批参考组件</h2>
            <p className="sectionDescription">
              同一个规范页面同时呈现设计来源、React 参考与实机验收规则
            </p>
          </div>
          <Link href="/components" className="textLink">
            查看全部 →
          </Link>
        </div>
        <div className="componentGrid">
          {catalog.components.slice(0, 4).map((component) => (
            <ComponentCard key={component.id} component={component} />
          ))}
        </div>
      </section>

      <section className="section twoColumn">
        <div className="panel">
          <div className="panelHeader">
            <div>
              <h2 className="panelTitle">体系覆盖矩阵</h2>
              <p className="panelDescription">
                区分有文档、有 React 参考与可自动验收，避免错误承诺
              </p>
            </div>
            <div style={{ width: 110 }}>
              <div className="progressTrack">
                <div
                  className="progressFill"
                  style={{ width: `${coveragePercent}%` }}
                />
              </div>
            </div>
          </div>
          <div className="coverageList">
            {coverages.map(({ component, coverage }) => (
              <div className="coverageRow" key={component.id}>
                <div className="coverageName">
                  <strong>{component.title}</strong>
                  <small>
                    {component.category} · v{component.version}
                  </small>
                </div>
                <CoverageSummary coverage={coverage} />
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panelHeader">
            <div>
              <h2 className="panelTitle">最近更新</h2>
              <p className="panelDescription">
                规范变更通过 Git 评审后发布
              </p>
            </div>
            <StatusBadge status="review" />
          </div>
          <div className="activityList">
            <div className="activityItem">
              <strong>新增下划线二级 Tab</strong>
              <p>绑定 Figma 节点并补充动态计数边界</p>
              <time>组件规范 · v1.0.0</time>
            </div>
            <div className="activityItem">
              <strong>建立通用审计规则目录</strong>
              <p>尺寸、间距、对齐、颜色与字体阈值可被团队查询</p>
              <time>验收规则 · Draft</time>
            </div>
            <div className="activityItem">
              <strong>统一 Tab 交互模式</strong>
              <p>补齐键盘操作、异常恢复和长文案策略</p>
              <time>交互规范 · Stable</time>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: "component" | "foundation" | "interaction" | "audit";
}) {
  return (
    <div className="metricCard">
      <div className="metricTop">
        <span>{label}</span>
        <span className="metricIcon">
          <Icon name={icon} size={16} />
        </span>
      </div>
      <strong className="metricValue">{value}</strong>
      <p className="metricHint">{hint}</p>
    </div>
  );
}
