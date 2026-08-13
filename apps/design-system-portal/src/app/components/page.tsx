import type { Metadata } from "next";
import Link from "next/link";
import { ComponentCard } from "@/components/component-card";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "组件",
};

export default async function ComponentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
  }>;
}) {
  const query = await searchParams;
  const { components } = await getCatalog();
  const filtered = components.filter(
    (component) => !query.status || component.status === query.status,
  );

  return (
    <>
      <header className="pageHeader">
        <div>
          <p className="eyebrow">COMPONENTS</p>
          <h1 className="pageTitle">组件体系</h1>
          <p className="pageDescription">
            每个组件都有稳定契约、交互状态、平台映射和验收白名单。React
            预览用于理解行为，不替代各端真实实现。
          </p>
        </div>
        <div className="headerActions">
          <span className="readonlyBadge">{components.length} Components</span>
        </div>
      </header>

      <div className="filterBar">
        <div className="filterGroup" aria-label="按状态筛选">
          <FilterLink href="/components" active={!query.status}>
            全部
          </FilterLink>
          <FilterLink
            href="/components?status=stable"
            active={query.status === "stable"}
          >
            稳定
          </FilterLink>
          <FilterLink
            href="/components?status=review"
            active={query.status === "review"}
          >
            评审中
          </FilterLink>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="componentGrid">
          {filtered.map((component) => (
            <ComponentCard key={component.id} component={component} />
          ))}
        </div>
      ) : (
        <div className="panel emptyState">
          <div>
            <h2>没有匹配的组件</h2>
            <p>当前筛选条件下暂无规范，清除筛选后查看全部组件。</p>
            <div className="buttonRow" style={{ justifyContent: "center", marginTop: 16 }}>
              <Link className="button buttonSecondary" href="/components">
                清除筛选
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`filterChip${active ? " filterChipActive" : ""}`}
    >
      {children}
    </Link>
  );
}
