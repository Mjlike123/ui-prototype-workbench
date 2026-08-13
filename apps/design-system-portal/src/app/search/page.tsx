import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "搜索",
};

type SearchResult = {
  type: string;
  title: string;
  description: string;
  href: string;
  keywords: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q?.trim() ?? "";
  const normalizedQuery = query.toLocaleLowerCase();
  const catalog = await getCatalog();

  const results: SearchResult[] = [
    ...catalog.components.map((component) => ({
      type: "组件",
      title: component.title,
      description: component.description ?? "",
      href: `/components/${component.id}`,
      keywords: [
        component.id,
        component.category,
        ...(component.tags ?? []),
        ...(component.detection.nameAliases ?? []),
      ].join(" "),
    })),
    ...catalog.foundations.map((foundation) => ({
      type: "视觉基础",
      title: foundation.title,
      description: foundation.description ?? "",
      href: `/foundations#${foundation.id}`,
      keywords: foundation.tokens
        .flatMap((token) => [token.id, token.name, token.description])
        .join(" "),
    })),
    ...catalog.interactions.map((interaction) => ({
      type: "交互",
      title: interaction.title,
      description: interaction.description,
      href: `/interactions/${interaction.id}`,
      keywords: [
        interaction.id,
        ...interaction.states,
        ...(interaction.edgeCases ?? []),
      ].join(" "),
    })),
    ...catalog.auditRegistries.flatMap((registry) =>
      registry.rules.map((rule) => ({
        type: "验收规则",
        title: rule.title,
        description: rule.description,
        href: "/audit",
        keywords: `${rule.id} ${rule.type} ${rule.appliesTo}`,
      })),
    ),
  ].filter((item) =>
    `${item.title} ${item.description} ${item.keywords}`
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );

  return (
    <>
      <header className="pageHeader">
        <div>
          <p className="eyebrow">SEARCH</p>
          <h1 className="pageTitle">
            {query ? `“${query}” 的搜索结果` : "搜索设计规范"}
          </h1>
          <p className="pageDescription">
            同时查询组件、Token、交互模式和验收规则。
          </p>
        </div>
      </header>

      {!query ? (
        <div className="panel emptyState">
          <div>
            <span className="emptyStateIcon">
              <Icon name="search" />
            </span>
            <h2>输入关键词开始搜索</h2>
            <p>例如：Tab、选中态、color.text.primary 或间距。</p>
          </div>
        </div>
      ) : results.length > 0 ? (
        <div>
          <p className="sectionDescription" style={{ marginBottom: 12 }}>
            找到 {results.length} 条结果
          </p>
          {results.map((result, index) => (
            <Link
              className="searchResult"
              href={result.href}
              key={`${result.type}-${result.title}-${index}`}
            >
              <div className="cardTopline">
                <strong>{result.title}</strong>
                <span className="tag">{result.type}</span>
              </div>
              <p>{result.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="panel emptyState">
          <div>
            <span className="emptyStateIcon">
              <Icon name="search" />
            </span>
            <h2>没有找到匹配内容</h2>
            <p>尝试组件名称、平台、Token ID 或更短的关键词。</p>
          </div>
        </div>
      )}
    </>
  );
}
