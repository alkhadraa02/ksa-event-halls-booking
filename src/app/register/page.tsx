import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "سجّل منشأتك",
  description: "أنشئ حساب منشأتك على منصة قاعات المناسبات، أضف قاعاتك وباقاتك واستقبل طلبات الحجز بعد اعتماد حسابك من الإدارة.",
  alternates: { canonical: "/register" },
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">سجّل منشأتك</h1>
        <p className="mb-5 mt-1 text-sm text-muted">يُراجع فريق المنصة الطلب، وبعد الاعتماد تظهر قاعاتك للعملاء.</p>
        <AuthForm mode="register" />
        <p className="mt-4 text-sm text-muted">
          لديك حساب؟{" "}
          <Link href="/login" className="font-semibold text-brand underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </main>
  );
}
