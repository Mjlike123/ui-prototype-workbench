import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { getCatalog } from "@/lib/catalog";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TopTop UI 原型工作台",
    template: "%s · TopTop UI 原型工作台",
  },
  description:
    "TopTop 团队 UI 原型工作台：组件、Token、交互规则、原型预览与验收闭环。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const catalog = await getCatalog();

  return (
    <html lang="zh-CN">
      <body>
        <AppShell
          interactionTabs={catalog.interactions.map((interaction) => ({
            href: `/interactions/${interaction.id}`,
            label: interaction.title,
          }))}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
