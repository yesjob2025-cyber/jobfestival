import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { session } from "@/lib/ev/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "기관 로그인" };

export default async function Page() {
  const s = await session();
  if (s.super) redirect("/console");
  if (s.orgId) redirect("/manage");
  return <LoginForm />;
}
