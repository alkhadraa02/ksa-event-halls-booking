# قاعات المناسبات — Events & Wedding Halls Booking

منصّة عربية لعرض وحجز قاعات الأفراح والمناسبات في السعودية، مع لوحة لأصحاب القاعات ولوحة إدارة لاعتماد المنشآت.
An Arabic-first (RTL) platform for browsing and booking wedding and event halls in Saudi Arabia, with a vendor dashboard and a platform admin area.

## المزايا | Features

**للزبائن (عام) | Public**
- بحث عن القاعات بالمدينة والسعة وقسم الرجال/النساء والسعر.
- صفحة قاعة فيها الباقات الإضافية (ضيافة، تنسيق، تصوير)، وتقويم التوفّر.
- طلب حجز يعرض مبلغ العربون (بلا دفع حقيقي) — Booking request with the deposit amount shown (no real payment).

**لأصحاب القاعات | Vendor dashboard**
- إدارة القاعات والباقات (إضافة/تعديل/حذف).
- تقويم بالتواريخ المحجوزة والمعلّقة، وحجب تواريخ يدوياً.
- قبول طلبات الحجز أو رفضها، قائمة العملاء، والإيرادات.

**لمدير المنصّة | Platform admin**
- اعتماد المنشآت أو رفضها قبل ظهور قاعاتها للعملاء.

**عام | General**
- كلمات المرور مُجزّأة (bcrypt) وجلسة في كعكة httpOnly.
- تحقّق من المدخلات بـ zod في كل واجهة API.
- SEO: metadata وsitemap وrobots وllms.txt وJSON-LD.

## لقطات الشاشة | Screenshots

_تُضاف هنا لقطات الصفحة الرئيسية وصفحة القاعة ولوحة المنشأة. / Add screenshots of the home page, hall page and vendor dashboard here._

## التقنيات | Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Prisma + SQLite · zod · bcryptjs · Vitest · IBM Plex Sans Arabic

## التشغيل في 5 أوامر | Setup in 5 commands

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

ثم افتح http://localhost:3108 — then open http://localhost:3108.

على PowerShell استعمل `Copy-Item .env.example .env` بدل `cp`.

## حساب المدير الافتراضي | Default admin login

القيم تأتي من `.env` (انظر `.env.example`)، وهي قيم تجريبية للتطوير فقط — غيّرها قبل أي نشر.
The values come from `.env` (see `.env.example`); they are development placeholders only — change them before any real deployment.

- البريد | Email: `admin@example.com` (`ADMIN_EMAIL`)
- كلمة المرور | Password: `ChangeMe-Admin-123` (`ADMIN_PASSWORD`)
- حسابات أصحاب القاعات التجريبية: `vendor.riyadh@example.com` وغيرها، وكلمة مرورها `DEMO_VENDOR_PASSWORD`.

## الأوامر | Scripts

| الأمر | الوظيفة |
| --- | --- |
| `npm run dev` | خادم التطوير على المنفذ 3108 |
| `npm run build` | بناء الإنتاج |
| `npm start` | تشغيل البناء على المنفذ 3108 |
| `npm test` | اختبارات Vitest (منطق الحجز + مسارات API) |
| `npm run db:push` | إنشاء جداول SQLite |
| `npm run db:seed` | بيانات سعودية تجريبية: 4 منشآت و10 قاعات + المدير |
| `npm run smoke` | فحص حيّ لرحلات الزبون والمنشأة والمدير على خادم يعمل |

## هيكل المشروع | Project structure

```
prisma/            schema.prisma + seed.ts
public/            llms.txt
scripts/smoke.mjs  فحص حيّ end-to-end
src/app/           الصفحات وواجهات API (halls, dashboard, admin, api/*)
src/components/    مكوّنات الواجهة (نماذج، تقويم، قوائم)
src/lib/           منطق الحجز والتواريخ والمصادقة والإحصاءات
tests/             اختبارات Vitest
```

## الترخيص | License

MIT — © TechnologyKSA
