import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { getCatalog } from "@/lib/catalog";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TopTop Design System",
    template: "%s · TopTop Design System",
  },
  description:
    "TopTop 团队内部视觉、组件、交互与多端验收规范门户。",
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
