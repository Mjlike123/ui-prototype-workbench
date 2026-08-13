import type { Metadata } from "next";
import { StatusBadge } from "@/components/spec-badges";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "体系治理",
};

export default async function GovernancePage() {
  const catalog = await getCatalog();

  return (
    <>
      <header className="pageHeader">
        <div>
          <p className="eyebrow">GOVERNANCE</p>
          <h1 className="pageTitle">体系治理</h1>
          <p className="pageDescription">
            规范不是一次性交付物。每项内容都有负责人、生命周期、版本和迁移策略，变更通过
            Schema 校验与 Git 评审发布。
          </p>
        </div>
      </header>

      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2 className="sectionTitle">生命周期</h2>
            <p className="sectionDescription">
              用户在采用组件前应能判断稳定性和后续风险
            </p>
          </div>
        </div>
        <div className="componentGrid">
          <LifecycleCard
            status="draft"
            title="Draft · 草稿"
            description="结构和 API 仍可能变化，仅用于探索和内部讨论。"
          />
          <LifecycleCard
            status="review"
            title="Review · 评审中"
            description="视觉与行为已具备参考价值，等待设计和多端工程共同确认。"
          />
          <LifecycleCard
            status="stable"
            title="Stable · 稳定"
            description="可用于生产；破坏性变更必须提升主版本并提供迁移说明。"
          />
          <LifecycleCard
            status="deprecated"
            title="Deprecated · 已废弃"
            description="不再用于新业务，保留替代组件、迁移窗口和删除时间。"
          />
        </div>
      </section>

      <section className="section twoColumn">
        <div className="contentCard">
          <h2>新增或修改规范</h2>
          <div className="stateFlow">
            {[
              "更新 YAML / MDX",
              "运行 Schema 校验",
              "生成 React 参考",
              "设计与工程评审",
              "合并并发布",
            ].map((step, index) => (
              <span key={step} style={{ display: "contents" }}>
                {index > 0 && <span className="stateArrow">→</span>}
                <span className="stateNode">{step}</span>
              </span>
            ))}
          </div>
          <h3>本地检查</h3>
          <code className="codeBlock">
            npm run specs:validate{"\n"}
            npm run portal:build{"\n"}
            npm test
          </code>
          <h3>内容职责</h3>
          <ul>
            <li>YAML 保存 ID、Token、Variant、平台映射和审计规则。</li>
            <li>MDX 保存场景、正反案例、异常路径和迁移说明。</li>
            <li>Figma 同步只写 generated 缓存，不覆盖人工维护内容。</li>
          </ul>
        </div>

        <div className="contentCard">
          <h2>当前体系健康度</h2>
          <div className="asideList">
            <HealthRow
              label="组件负责人完整"
              value={catalog.components.every((item) => item.owner)}
            />
            <HealthRow
              label="组件版本完整"
              value={catalog.components.every((item) => item.version)}
            />
            <HealthRow
              label="平台映射已结构化"
              value={catalog.platformMappings.length > 0}
            />
            <HealthRow
              label="交互异常路径已记录"
              value={catalog.interactions.every(
                (item) => (item.edgeCases?.length ?? 0) > 0,
              )}
            />
          </div>
          <h3>首期边界</h3>
          <p>
            Portal 可作为外网只读 Kit 发布；私有资源由部署网关保护。站内不托管模型，也不负责编辑、审批和账号体系，避免形成第二个规范源。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2 className="sectionTitle">组件责任矩阵</h2>
            <p className="sectionDescription">
              版本和覆盖状态必须与组件负责人共同维护
            </p>
          </div>
        </div>
        <div className="panel">
          <table className="specTable">
            <thead>
              <tr>
                <th>组件</th>
                <th>负责人</th>
                <th>状态</th>
                <th>版本</th>
                <th>平台</th>
                <th>审计规则</th>
              </tr>
            </thead>
            <tbody>
              {catalog.components.map((component) => (
                <tr key={component.id}>
                  <td>
                    <strong>{component.title}</strong>
                    <br />
                    <code>{component.id}</code>
                  </td>
                  <td>{component.owner}</td>
                  <td>
                    <StatusBadge status={component.status} />
                  </td>
                  <td>{component.version}</td>
                  <td>{component.platforms.join(" / ")}</td>
                  <td>{component.rules.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function LifecycleCard({
  status,
  title,
  description,
}: {
  status: "draft" | "review" | "stable" | "deprecated";
  title: string;
  description: string;
}) {
  return (
    <article className="contentCard">
      <div className="cardTopline">
        <h3 className="cardTitle">{title}</h3>
        <StatusBadge status={status} />
      </div>
      <p className="cardDescription">{description}</p>
    </article>
  );
}

function HealthRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="asideRow">
      <span>{label}</span>
      <span
        className={`coveragePill ${
          value ? "coverageReady" : "coveragePending"
        }`}
      >
        {value ? "通过" : "待完善"}
      </span>
    </div>
  );
}
