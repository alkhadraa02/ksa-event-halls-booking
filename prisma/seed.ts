import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDaysKey, todayKey } from "../src/lib/dates";
import { calcQuote, generateRef } from "../src/lib/booking";

try {
  process.loadEnvFile(".env");
} catch {
  // .env is optional when variables are already exported
}

const db = new PrismaClient();

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Copy .env.example to .env first.`);
  return value;
}

type HallSeed = {
  slug: string;
  name: string;
  city: string;
  district: string;
  section: "BOTH" | "MEN" | "WOMEN";
  capacityMen: number;
  capacityWomen: number;
  basePrice: number;
  depositPercent: number;
  description: string;
  amenities: string;
};

type VendorSeed = {
  email: string;
  name: string;
  phone: string;
  businessName: string;
  city: string;
  description: string;
  status: "APPROVED" | "PENDING";
  halls: HallSeed[];
};

const vendors: VendorSeed[] = [
  {
    email: "vendor.riyadh@example.com",
    name: "سلطان العتيبي",
    phone: "0501110001",
    businessName: "روائع الأفراح للقاعات",
    city: "الرياض",
    description: "نوفّر قاعات أفراح فاخرة في الرياض منذ أكثر من اثني عشر عاماً.",
    status: "APPROVED",
    halls: [
      {
        slug: "qasr-alyasmin-riyadh",
        name: "قصر الياسمين",
        city: "الرياض",
        district: "حي الملقا",
        section: "BOTH",
        capacityMen: 400,
        capacityWomen: 350,
        basePrice: 38000,
        depositPercent: 20,
        description:
          "قصر أفراح بقسمين منفصلين تماماً للرجال والنساء، مدخل خاص لكل قسم، ومسرح رئيسي وكوشة مجهّزة بإضاءة حديثة. يتوفر مواقف تتسع لأكثر من ٣٠٠ سيارة.",
        amenities: "مواقف واسعة، مدخل خاص للعروس، تكييف مركزي، غرفة تجهيز العروس، نظام صوت متكامل",
      },
      {
        slug: "qaat-alnarjis-riyadh",
        name: "قاعة النرجس",
        city: "الرياض",
        district: "حي النرجس",
        section: "WOMEN",
        capacityMen: 0,
        capacityWomen: 280,
        basePrice: 19000,
        depositPercent: 25,
        description: "قاعة نسائية مستقلة مناسبة لحفلات الزفاف والخطوبة وحفلات التخرج، بتصميم عصري وإضاءة دافئة.",
        amenities: "مواقف خاصة، غرفة العروس، ركن ضيافة، شاشات عرض",
      },
    ],
  },
  {
    email: "vendor.jeddah@example.com",
    name: "منى الغامدي",
    phone: "0502220002",
    businessName: "لمسة الأحلام للمناسبات",
    city: "جدة",
    description: "قاعات ومناسبات على كورنيش جدة وأحيائها الراقية، مع فريق تنسيق متكامل.",
    status: "APPROVED",
    halls: [
      {
        slug: "qaat-arjuwan-jeddah",
        name: "قاعة أرجوان",
        city: "جدة",
        district: "حي الشاطئ",
        section: "BOTH",
        capacityMen: 500,
        capacityWomen: 450,
        basePrice: 52000,
        depositPercent: 20,
        description: "من أكبر قاعات جدة، بإطلالة بحرية وصالة استقبال منفصلة وقاعة طعام مستقلة لكل قسم.",
        amenities: "إطلالة بحرية، خدمة صف السيارات، تكييف مركزي، مصاعد، غرفة كبار الشخصيات",
      },
      {
        slug: "qaat-alward-altaifi-taif",
        name: "قاعة الورد الطائفي",
        city: "الطائف",
        district: "حي الشهداء",
        section: "WOMEN",
        capacityMen: 0,
        capacityWomen: 250,
        basePrice: 14000,
        depositPercent: 20,
        description: "قاعة نسائية بطابع الورد الطائفي المميز، مناسبة للمناسبات العائلية والخطوبة.",
        amenities: "حديقة خارجية، مواقف، غرفة تجهيز، ركن تصوير",
      },
      {
        slug: "qaat-nakhil-taibah-madinah",
        name: "قاعة نخيل طيبة",
        city: "المدينة المنورة",
        district: "حي العزيزية",
        section: "BOTH",
        capacityMen: 350,
        capacityWomen: 300,
        basePrice: 30000,
        depositPercent: 20,
        description: "قاعة بتصميم تراثي مستوحى من النخيل، بقسمين مستقلين ومواقف واسعة وخدمة ضيافة راقية.",
        amenities: "مواقف واسعة، مجلس قهوة، تكييف مركزي، شاشات عرض",
      },
    ],
  },
  {
    email: "vendor.eastern@example.com",
    name: "فهد الدوسري",
    phone: "0503330003",
    businessName: "المنطقة الشرقية للقاعات",
    city: "الدمام",
    description: "قاعات متنوعة في الدمام والخبر وبريدة وأبها لمختلف المناسبات.",
    status: "APPROVED",
    halls: [
      {
        slug: "qaat-lulu-alkhalij-dammam",
        name: "قاعة لؤلؤة الخليج",
        city: "الدمام",
        district: "حي الشاطئ الغربي",
        section: "BOTH",
        capacityMen: 300,
        capacityWomen: 300,
        basePrice: 26000,
        depositPercent: 20,
        description: "قاعة متكاملة بقسمين متساويين، وردهة استقبال بتصميم بحري أنيق.",
        amenities: "مواقف، تكييف مركزي، غرفة العروس، نظام إضاءة ذكي",
      },
      {
        slug: "qaat-almasa-khobar",
        name: "قاعة الماسة",
        city: "الخبر",
        district: "حي الحزام الذهبي",
        section: "BOTH",
        capacityMen: 250,
        capacityWomen: 250,
        basePrice: 22000,
        depositPercent: 20,
        description: "قاعة وسط الخبر، مناسبة للأفراح المتوسطة والفعاليات العائلية.",
        amenities: "مواقف، مصعد، ركن ضيافة، شاشة عرض كبيرة",
      },
      {
        slug: "majlis-alfursan-buraidah",
        name: "مجلس الفرسان للمناسبات",
        city: "بريدة",
        district: "حي الصفراء",
        section: "MEN",
        capacityMen: 350,
        capacityWomen: 0,
        basePrice: 12000,
        depositPercent: 25,
        description: "مجلس رجالي واسع مناسب للولائم والملكات والمناسبات الرجالية الكبيرة.",
        amenities: "مواقف واسعة، مجلس قهوة، مطبخ مجهّز",
      },
      {
        slug: "qaat-sahab-abha",
        name: "قاعة سحاب",
        city: "أبها",
        district: "حي المنسك",
        section: "BOTH",
        capacityMen: 200,
        capacityWomen: 200,
        basePrice: 15000,
        depositPercent: 20,
        description: "قاعة بإطلالة جبلية خلابة، مناسبة لحفلات الزفاف الصغيرة والمتوسطة.",
        amenities: "إطلالة جبلية، مواقف، تكييف، ركن تصوير خارجي",
      },
    ],
  },
  {
    email: "vendor.makkah@example.com",
    name: "عبدالله الحربي",
    phone: "0504440004",
    businessName: "قاعات الندى",
    city: "مكة المكرمة",
    description: "منشأة جديدة تنتظر الاعتماد من إدارة المنصة.",
    status: "PENDING",
    halls: [
      {
        slug: "qaat-alnada-makkah",
        name: "قاعة الندى",
        city: "مكة المكرمة",
        district: "حي الشوقية",
        section: "BOTH",
        capacityMen: 300,
        capacityWomen: 300,
        basePrice: 24000,
        depositPercent: 20,
        description: "قاعة جديدة قيد الاعتماد.",
        amenities: "مواقف، تكييف مركزي",
      },
    ],
  },
];

const customers = [
  { name: "خالد الشهري", phone: "0555550101" },
  { name: "نورة القحطاني", phone: "0555550102" },
  { name: "ريم السبيعي", phone: "0555550103" },
  { name: "ماجد الزهراني", phone: "0555550104" },
  { name: "هند المطيري", phone: "0555550105" },
  { name: "تركي العنزي", phone: "0555550106" },
  { name: "لمى البلوي", phone: "0555550107" },
  { name: "عبدالرحمن الشمري", phone: "0555550108" },
];

const EVENTS = ["WEDDING", "WEDDING", "ENGAGEMENT", "GRADUATION", "BIRTHDAY", "CORPORATE"];

async function main() {
  const adminEmail = required("ADMIN_EMAIL").toLowerCase();
  const adminPassword = required("ADMIN_PASSWORD");
  const vendorPassword = required("DEMO_VENDOR_PASSWORD");

  await db.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: await bcrypt.hash(adminPassword, 10), role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "مدير المنصة",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });
  console.log(`Admin ready: ${adminEmail}`);

  if ((await db.vendor.count()) > 0) {
    console.log("Demo data already present, skipping. Use `npx prisma db push --force-reset` to start over.");
    return;
  }

  const vendorHash = await bcrypt.hash(vendorPassword, 10);
  const today = todayKey();
  let customerIx = 0;
  let hallIx = 0;

  for (const v of vendors) {
    const user = await db.user.create({
      data: { email: v.email, name: v.name, phone: v.phone, passwordHash: vendorHash, role: "VENDOR" },
    });
    const vendor = await db.vendor.create({
      data: {
        userId: user.id,
        businessName: v.businessName,
        city: v.city,
        phone: v.phone,
        description: v.description,
        status: v.status,
      },
    });

    for (const h of v.halls) {
      hallIx++;
      const hall = await db.hall.create({
        data: { ...h, vendorId: vendor.id, published: true },
      });

      const pkgs = await Promise.all(
        [
          { name: "بوفيه فاخر مفتوح", category: "CATERING", price: Math.round(h.basePrice * 0.45), description: "بوفيه متنوع من المأكولات الشرقية والغربية مع الحلويات." },
          { name: "قهوة وشاي وتمور", category: "CATERING", price: Math.round(h.basePrice * 0.08), description: "ركن ضيافة عربي لاستقبال الضيوف." },
          { name: "كوشة وتنسيق زهور", category: "DECORATION", price: Math.round(h.basePrice * 0.25), description: "كوشة مخصصة وتنسيق طاولات وممشى العروس." },
          { name: "إضاءة وليزر", category: "DECORATION", price: Math.round(h.basePrice * 0.1), description: "عرض إضاءة وليزر لدخول العروسين." },
          { name: "تصوير فوتوغرافي وفيديو", category: "PHOTOGRAPHY", price: Math.round(h.basePrice * 0.15), description: "مصور وفيديو محترف مع ألبوم مطبوع." },
        ].map((p) => db.package.create({ data: { ...p, hallId: hall.id } })),
      );

      if (v.status !== "APPROVED") continue;

      // Blocked days (maintenance / private use)
      await db.blockedDate.create({
        data: { hallId: hall.id, date: addDaysKey(today, 9 + hallIx), reason: "صيانة دورية" },
      });

      // Bookings: one approved, two pending, one declined, one past approved
      const plan: { offset: number; status: "APPROVED" | "PENDING" | "DECLINED" }[] = [
        { offset: -20 - hallIx, status: "APPROVED" },
        { offset: 14 + hallIx, status: "APPROVED" },
        { offset: 30 + hallIx, status: "PENDING" },
        { offset: 45 + hallIx, status: "PENDING" },
        { offset: 21 + hallIx, status: "DECLINED" },
      ];
      for (const slot of plan) {
        const c = customers[customerIx++ % customers.length];
        const section = h.section === "BOTH" ? "BOTH" : h.section;
        const cap = h.section === "BOTH" ? h.capacityMen + h.capacityWomen : Math.max(h.capacityMen, h.capacityWomen);
        const chosen = pkgs.filter((_, i) => (i + customerIx) % 3 === 0);
        const quote = calcQuote({ basePrice: h.basePrice, depositPercent: h.depositPercent, addons: chosen });
        await db.booking.create({
          data: {
            ref: generateRef(),
            hallId: hall.id,
            date: addDaysKey(today, slot.offset),
            eventType: EVENTS[(customerIx + hallIx) % EVENTS.length],
            section,
            guests: Math.min(cap, 120 + ((customerIx * 37) % 180)),
            customerName: c.name,
            customerPhone: c.phone,
            notes: "",
            status: slot.status,
            decidedAt: slot.status === "PENDING" ? null : new Date(),
            ...quote,
            packages: { create: chosen.map((p) => ({ packageId: p.id, name: p.name, price: p.price })) },
          },
        });
      }
    }
  }
  console.log("Seed complete: 4 vendors, " + hallIx + " halls.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
