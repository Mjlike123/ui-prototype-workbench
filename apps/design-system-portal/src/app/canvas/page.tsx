import type { Metadata } from "next";
import { redirect } from "next/navigation";

export default function CanvasIndexPage() {
  redirect("/canvas/core");
}
