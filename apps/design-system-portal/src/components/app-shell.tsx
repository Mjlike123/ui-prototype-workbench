"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { foundationNavTabs } from "@/lib/foundation-nav";
import { Icon } from "./icons";

const navigation = [
  { href: "/", label: "总览", icon: "home" as const },
  { href: "/principles", label: "设计原则", icon: "principle" as const },
  {
    href: "/getting-started",
    label: "Agent 协作",
    icon: "guide" as const,
  },
  {
    href: "/foundations",
    label: "视觉基础",
    icon: "foundation" as const,
  },
  {
    href: "/components",
    label: "组件",
    icon: "component" as const,
  },
  {
    href: "/interactions",
    label: "交互与模式",
    icon: "interaction" as const,
  },
  { href: "/canvas", label: "原型预览", icon: "canvas" as const },
  { href: "/audit", label: "验收中心", icon: "audit" as const },
  {
    href: "/governance",
    label: "体系治理",
    icon: "governance" as const,
  },
];

const auditTabs = [
  { href: "/audit", label: "验收中心总览" },
  { href: "/audit/visual", label: "视觉走查工作台" },
];

type DrawerTab = {
  href: string;
  label: string;
};

export function AppShell({
  children,
  interactionTabs,
}: {
  children: React.ReactNode;
  interactionTabs: DrawerTab[];
}) {
  const pathname = usePathname();
  const [foundationHash, setFoundationHash] = useState("");
  const [foundationsOpen, setFoundationsOpen] = useState(
    pathname.startsWith("/foundations"),
  );
  const [interactionsOpen, setInteractionsOpen] = useState(
    pathname.startsWith("/interactions"),
  );
  const [auditOpen, setAuditOpen] = useState(pathname.startsWith("/audit"));
  const isPrototypeRuntime = pathname.startsWith("/prototype-runtime/");
  const isComponentDetail =
    pathname.startsWith("/components/") && pathname !== "/components";

  useEffect(() => {
    const syncFoundationHash = () => {
      setFoundationHash(window.location.hash.replace(/^#/, ""));
    };

    syncFoundationHash();
    window.addEventListener("hashchange", syncFoundationHash);
    return () => window.removeEventListener("hashchange", syncFoundationHash);
  }, [pathname]);

  if (isPrototypeRuntime) {
    return <>{children}</>;
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="TopTop UI 原型工作台 首页">
          <span className="brandMark">T</span>
          <span>
            <strong>TopTop Design</strong>
            <small>UI 原型工作台</small>
          </span>
        </Link>

        <nav className="mainNav" aria-label="主导航">
          <p className="navCaption">DESIGN SYSTEM</p>
          {navigation.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            if (item.href === "/foundations") {
              return (
                <div className="navDrawer" key={item.href}>
                  <div
                    className={`navDrawerTrigger${
                      active ? " navDrawerTriggerActive" : ""
                    }`}
                  >
                    <Link
                      href={item.href}
                      className="navItem navDrawerLink"
                      onClick={() => setFoundationsOpen(true)}
                    >
                      <Icon name={item.icon} />
                      <span>{item.label}</span>
                    </Link>
                    <button
                      className="navDrawerToggle"
                      type="button"
                      aria-expanded={foundationsOpen}
                      aria-controls="foundation-drawer-tabs"
                      aria-label={`${foundationsOpen ? "收起" : "展开"}视觉基础`}
                      onClick={() => setFoundationsOpen((open) => !open)}
                    >
                      <span aria-hidden="true">›</span>
                    </button>
                  </div>
                  <div
                    className={`navDrawerPanel${
                      foundationsOpen ? " navDrawerPanelOpen" : ""
                    }`}
                    id="foundation-drawer-tabs"
                    aria-hidden={!foundationsOpen}
                    inert={!foundationsOpen}
                  >
                    <div>
                      {foundationNavTabs.map((tab) => {
                        const tabHash = tab.href.split("#")[1] ?? "";
                        const tabActive =
                          pathname.startsWith("/foundations") &&
                          (foundationHash
                            ? foundationHash === tabHash
                            : tabHash === foundationNavTabs[0]?.href.split("#")[1]);
                        return (
                          <Link
                            className={`navDrawerTab${
                              tabActive ? " navDrawerTabActive" : ""
                            }`}
                            href={tab.href}
                            aria-current={tabActive ? "page" : undefined}
                            key={tab.href}
                          >
                            {tab.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }
            if (item.href === "/interactions") {
              return (
                <div className="navDrawer" key={item.href}>
                  <div
                    className={`navDrawerTrigger${
                      active ? " navDrawerTriggerActive" : ""
                    }`}
                  >
                    <Link
                      href={item.href}
                      className="navItem navDrawerLink"
                      onClick={() => setInteractionsOpen(true)}
                    >
                      <Icon name={item.icon} />
                      <span>{item.label}</span>
                    </Link>
                    <button
                      className="navDrawerToggle"
                      type="button"
                      aria-expanded={interactionsOpen}
                      aria-controls="interaction-drawer-tabs"
                      aria-label={`${interactionsOpen ? "收起" : "展开"}交互与模式`}
                      onClick={() => setInteractionsOpen((open) => !open)}
                    >
                      <span aria-hidden="true">›</span>
                    </button>
                  </div>
                  <div
                    className={`navDrawerPanel${
                      interactionsOpen ? " navDrawerPanelOpen" : ""
                    }`}
                    id="interaction-drawer-tabs"
                    aria-hidden={!interactionsOpen}
                    inert={!interactionsOpen}
                  >
                    <div>
                      {interactionTabs.map((tab) => {
                        const tabActive = pathname === tab.href;
                        return (
                          <Link
                            className={`navDrawerTab${
                              tabActive ? " navDrawerTabActive" : ""
                            }`}
                            href={tab.href}
                            aria-current={tabActive ? "page" : undefined}
                            key={tab.href}
                          >
                            {tab.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }
            if (item.href === "/audit") {
              return (
                <div className="navDrawer" key={item.href}>
                  <div
                    className={`navDrawerTrigger${
                      active ? " navDrawerTriggerActive" : ""
                    }`}
                  >
                    <Link
                      href={item.href}
                      className="navItem navDrawerLink"
                      onClick={() => setAuditOpen(true)}
                    >
                      <Icon name={item.icon} />
                      <span>{item.label}</span>
                    </Link>
                    <button
                      className="navDrawerToggle"
                      type="button"
                      aria-expanded={auditOpen}
                      aria-controls="audit-drawer-tabs"
                      aria-label={`${auditOpen ? "收起" : "展开"}验收中心`}
                      onClick={() => setAuditOpen((open) => !open)}
                    >
                      <span aria-hidden="true">›</span>
                    </button>
                  </div>
                  <div
                    className={`navDrawerPanel${
                      auditOpen ? " navDrawerPanelOpen" : ""
                    }`}
                    id="audit-drawer-tabs"
                    aria-hidden={!auditOpen}
                    inert={!auditOpen}
                  >
                    <div>
                      {auditTabs.map((tab) => {
                        const tabActive = pathname === tab.href;
                        return (
                          <Link
                            className={`navDrawerTab${
                              tabActive ? " navDrawerTabActive" : ""
                            }`}
                            href={tab.href}
                            aria-current={tabActive ? "page" : undefined}
                            key={tab.href}
                          >
                            {tab.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`navItem${active ? " navItemActive" : ""}`}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebarMeta">
          <span className="environmentDot" />
          <div>
            <strong>Agent Kit Beta</strong>
            <small>只读 · 由 Git 发布</small>
          </div>
        </div>
      </aside>

      <div
        className={`workspace${isComponentDetail ? " componentDetailWorkspace" : ""}`}
      >
        <header className="topbar">
          <div className="mobileBrand">
            <span className="brandMark">T</span>
            <strong>TopTop Design</strong>
          </div>
          <form action="/search" className="globalSearch" role="search">
            <Icon name="search" />
            <input
              name="q"
              aria-label="搜索设计规范"
              placeholder="搜索组件、Token、交互规范…"
            />
            <kbd>⌘ K</kbd>
          </form>
          <div className="topbarActions">
            <a
              className="iconButton"
              href="https://www.figma.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="打开 Figma"
            >
              <Icon name="external" />
            </a>
          </div>
        </header>
        <main
          className={`pageContainer${isComponentDetail ? " componentDetailContainer" : ""}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
