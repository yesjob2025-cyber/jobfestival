import type { Metadata } from "next";
import { HostHome } from "./host-home";

export const metadata: Metadata = { title: "행사 운영 — 담당자" };

export default function Page() {
  return <HostHome />;
}
