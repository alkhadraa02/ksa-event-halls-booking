import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "سجّل دخولك إلى لوحة تحكم منشأتك لإدارة القاعات والباقات وطلبات الحجز على منصة قاعات المناسبات.",
  alternates: { canonical: "/login" },
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
        <p className="mb-5 mt-1 text-sm text-muted">لأصحاب القاعات ومدير المنصة.</p>
        <AuthForm mode="login" />
        <p className="mt-4 text-sm text-muted">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-semibold text-brand underline">
            سجّل منشأتك
          </Link>
        </p>
      </div>
    </main>
  );
}
