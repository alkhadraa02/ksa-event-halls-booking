import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { MobileNav } from "./mobile-nav";
import { LogoutButton } from "./logout-button";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const links = [
    { href: "/", label: "الرئيسية" },
    { href: "/halls", label: "القاعات" },
  ];
  const home = user ? (user.role === "ADMIN" ? "/admin" : "/dashboard") : null;

  return (
    <header className="sticky top-0 border-b border-line bg-surface" style={{ zIndex: "var(--z-header)" }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="min-w-0 truncate text-lg font-bold text-brand">
          قاعات المناسبات
        </Link>

        <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-5 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="py-2 font-medium hover:text-brand">
              {l.label}
            </Link>
          ))}
          {home ? (
            <>
              <Link href={home} className="btn btn-outline btn-sm">
                {user?.role === "ADMIN" ? "لوحة الإدارة" : "لوحة المنشأة"}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="py-2 font-medium hover:text-brand">
                دخول
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                سجّل منشأتك
              </Link>
            </>
          )}
        </nav>

        <MobileNav
          links={links}
          authed={Boolean(user)}
          dashboardHref={home}
          dashboardLabel={user?.role === "ADMIN" ? "لوحة الإدارة" : "لوحة المنشأة"}
        />
      </div>
    </header>
  );
}
