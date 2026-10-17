import type { Metadata, Viewport } from "next";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "قاعات المناسبات — احجز قاعة زفافك بسهولة", template: "%s | قاعات المناسبات" },
  description: "ابحث عن قاعات الأفراح والمناسبات في مدن المملكة، قارن الأسعار والسعات، وأرسل طلب الحجز مع العربون المطلوب.",
  openGraph: { type: "website", locale: "ar_SA", siteName: "قاعات المناسبات" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#6b2d5c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <a href="#main" className="skip-link">
          تخطَّ إلى المحتوى
        </a>
        <SiteHeader />
        <div id="main" tabIndex={-1}>
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
