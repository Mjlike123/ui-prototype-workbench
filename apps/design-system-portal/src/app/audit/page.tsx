import type { Metadata } from "next";
import Link from "next/link";
import { AuditLauncher } from "@/components/audit-launcher";
import { Icon } from "@/components/icons";
import { CoveragePill, PlatformBadges } from "@/components/spec-badges";
import { getAuditServiceStatus } from "@/lib/audit-service";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "验收中心",
};

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const [catalog, service] = await Promise.all([
    getCatalog(),
    getAuditServiceStatus(),
  ]);
  const ruleCount = catalog.components.reduce(
    (sum, component) => sum + component.rules.length,
    0,
  );

  return (
    <>
      <header className="pageHeader">
        <div>
          <p className="eyebrow">QUALITY BRIDGE</p>
          <h1 className="pageTitle">验收中心</h1>
          <p className="pageDescription">
            UI 验收需要组合多种手段：原则与体验、Kit 组件规则、局部结构与像素、整页视觉。
            Lookin 负责实机结构与 Kit 白名单；其余路径在 Portal、Cursor Skills 与截图工具中完成。
          </p>
        </div>
        <div className="headerActions">
          <a
            className="button buttonSecondary"
            href="http://127.0.0.1:4317"
            target="_blank"
            rel="noreferrer"
          >
            打开审计服务 <Icon name="external" size={15} />
          </a>
        </div>
      </header>

      <section className="auditHero">
        <div className="panel">
          <div className="panelHeader">
            <div>
              <h2 className="panelTitle">本地 Lookin 审计服务</h2>
              <p className="panelDescription">
                Portal 仅代理只读规范信息，设备连接和审计仍在原生工具中执行
              </p>
            </div>
            <CoveragePill ready={service.online}>
              {service.online ? "在线" : "未连接"}
            </CoveragePill>
          </div>
          <div className="serviceStatus">
            <span
              className={`statusIndicator ${
                service.online ? "" : "statusIndicatorOffline"
              }`}
            />
            <div>
              <strong>
                {service.online
                  ? `已发现 ${service.profiles.length} 个运行时 Profile`
                  : "未检测到 127.0.0.1:4317"}
              </strong>
              <p className="panelDescription">
                {service.online
                  ? "可以在 Lookin 中选择组件并按当前规范执行比较。"
                  : "运行 npm run ui 后刷新本页；离线不影响浏览设计规范。"}
              </p>
            </div>
          </div>
          <div className="buttonRow" style={{ marginTop: 16 }}>
            <code className="codeBlock" style={{ flex: 1, marginTop: 0 }}>
              npm run ui
            </code>
          </div>
          <AuditLauncher serviceOnline={service.online} />
        </div>

        <div className="panel">
          <div className="panelHeader">
            <div>
              <h2 className="panelTitle">规则规模</h2>
              <p className="panelDescription">可查阅不等于可自动执行</p>
            </div>
          </div>
          <div className="metricGrid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 0 }}>
            <div>
              <strong className="metricValue">{ruleCount}</strong>
              <p className="metricHint">组件白名单规则</p>
            </div>
            <div>
              <strong className="metricValue">
                {catalog.auditRegistries.reduce(
                  (sum, registry) => sum + registry.rules.length,
                  0,
                )}
              </strong>
              <p className="metricHint">通用差异规则</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2 className="sectionTitle">综合验收：按场景组合</h2>
            <p className="sectionDescription">
              没有单一路径能覆盖整页 UI。交付前按页面组成选用下面几种能力，结论合并记录。
            </p>
          </div>
        </div>
        <div className="componentGrid">
          <article className="contentCard">
            <h3 className="cardTitle">原则与体验</h3>
            <p className="cardDescription">
              只有设计稿、或需要判断「好不好用、是否符合 Kit 价值观」时使用。回答任务是否清晰、层级与一致性是否合理。
            </p>
            <div className="buttonRow">
              <Link className="textLink" href="/principles">
                设计原则 →
              </Link>
              <Link className="textLink" href="/getting-started">
                toptop-design-review →
              </Link>
            </div>
            <p className="cardMeta">
              <strong>典型输入</strong> Figma 帧、产品目标、截图
            </p>
          </article>
          <article className="contentCard">
            <h3 className="cardTitle">Kit 组件（Lookin Profile）</h3>
            <p className="cardDescription">
              标准导航、Tab、按钮等已入库组件。按 YAML 白名单比尺寸、间距与选中态，不替代整页审查。
            </p>
            <div className="buttonRow">
              <Link className="textLink" href="/components">
                组件规范 →
              </Link>
            </div>
            <p className="cardMeta">
              <strong>典型输入</strong> 实机 + 选中组件根 + Profile
            </p>
          </article>
          <article className="contentCard">
            <h3 className="cardTitle">局部结构与像素</h3>
            <p className="cardDescription">
              业务区块、无 Profile 的容器。Lookin 选「通用节点审计」并粘贴具体 Figma Frame；或用 CLI 对比导出帧与实机截图。
            </p>
            <p className="cardMeta">
              <code>generic-rules.yaml</code> ·{" "}
              <code>npm run verify:screenshot</code>
            </p>
          </article>
          <article className="contentCard">
            <h3 className="cardTitle">整页视觉（叠图）</h3>
            <p className="cardDescription">
              整屏还原度与布局漂移。上传设计稿和实现截图，使用标注、平铺与透明叠加完成本地走查。
            </p>
            <div className="buttonRow">
              <Link className="textLink" href="/audit/visual">
                打开视觉走查工作台 →
              </Link>
            </div>
            <p className="cardMeta">
              <strong>典型输入</strong> 同视口 reference.png + actual.png
            </p>
          </article>
        </div>
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panelHeader">
            <div>
              <h2 className="panelTitle">推荐组合（完整页面交付）</h2>
              <p className="panelDescription">
                标准件用 Kit；中间业务区用 Frame + 通用规则或叠图；整页再用原则审查收束 P0/P1。
              </p>
            </div>
          </div>
          <div className="stateFlow">
            {[
              "对齐原则",
              "Kit 块逐项 Lookin",
              "业务区 Frame 或叠图",
              "Cursor 综合审查",
              "导出问题清单",
            ].map((step, index) => (
              <span key={step} style={{ display: "contents" }}>
                {index > 0 && <span className="stateArrow">→</span>}
                <span className="stateNode">{step}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2 className="sectionTitle">组件验收覆盖</h2>
            <p className="sectionDescription">
              规范存在不代表语义提取器已经支持；当前以 Secondary Tab 为首批能力
            </p>
          </div>
        </div>
        <div className="panel">
          <div className="coverageList">
            {catalog.components.map((component) => {
              const runtimeProfile = service.profiles.find(
                (profile) => profile.id === component.id,
              );
              return (
                <div className="coverageRow" key={component.id}>
                  <div className="coverageName">
                    <Link href={`/components/${component.id}`}>
                      <strong>{component.title}</strong>
                    </Link>
                    <small>
                      {component.rules.length} rules · v{component.version}
                    </small>
                  </div>
                  <CoveragePill ready={component.rules.length > 0}>
                    规则
                  </CoveragePill>
                  <CoveragePill ready={component.platforms.includes("ios")}>
                    iOS
                  </CoveragePill>
                  <CoveragePill ready={Boolean(runtimeProfile)}>
                    {runtimeProfile ? "已加载" : "离线"}
                  </CoveragePill>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2 className="sectionTitle">通用审计规则</h2>
            <p className="sectionDescription">
              无法识别组件 Profile 时使用，低置信度问题需要人工确认
            </p>
          </div>
        </div>
        <div className="componentGrid">
          {catalog.auditRegistries.flatMap((registry) =>
            registry.rules.map((rule) => (
              <article className="contentCard" key={rule.id}>
                <div className="cardTopline">
                  <h3 className="cardTitle">{rule.title}</h3>
                  <span className="ruleCategory">{rule.type}</span>
                </div>
                <p className="cardDescription">{rule.description}</p>
                <div className="cardMeta">
                  <code>{rule.id}</code>
                  <strong>{rule.threshold}</strong>
                </div>
              </article>
            )),
          )}
        </div>
      </section>

      <section className="section panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Lookin · Kit 组件路径</h2>
            <p className="panelDescription">
              下列步骤仅适用于已入库组件；整页或业务区请结合上方综合验收中的其他路径
            </p>
          </div>
          <PlatformBadges platforms={["ios"]} />
        </div>
        <div className="stateFlow">
          {[
            "选择 Lookin 容器",
            "粘贴 Figma Frame",
            "自动识别 Profile",
            "确认聚合问题",
            "导出飞书报告",
          ].map((step, index) => (
            <span key={step} style={{ display: "contents" }}>
              {index > 0 && <span className="stateArrow">→</span>}
              <span className="stateNode">{step}</span>
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
