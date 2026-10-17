"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "./logout-button";

type Props = {
  links: { href: string; label: string }[];
  authed: boolean;
  dashboardHref: string | null;
  dashboardLabel: string;
};

export function MobileNav({ links, authed, dashboardHref, dashboardLabel }: Props) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      buttonRef.current?.focus();
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-outline btn-sm"
        aria-label="فتح القائمة"
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={() => setOpen(true)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-overlay"
            style={{ zIndex: "var(--z-overlay)" }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="القائمة"
            className="fixed inset-y-0 end-0 flex w-72 max-w-[85vw] flex-col gap-2 bg-surface p-4 shadow-xl"
            style={{ zIndex: "var(--z-drawer)" }}
          >
            <button
              ref={closeRef}
              type="button"
              className="btn btn-outline btn-sm self-start"
              aria-label="إغلاق القائمة"
              onClick={() => setOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <nav aria-label="القائمة" className="mt-2 flex flex-col">
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-line py-3 font-medium">
                  {l.label}
                </Link>
              ))}
              {authed && dashboardHref ? (
                <>
                  <Link href={dashboardHref} onClick={() => setOpen(false)} className="border-b border-line py-3 font-medium">
                    {dashboardLabel}
                  </Link>
                  <div className="pt-3">
                    <LogoutButton />
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="border-b border-line py-3 font-medium">
                    دخول
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="btn btn-primary mt-3">
                    سجّل منشأتك
                  </Link>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
