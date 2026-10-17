// Live smoke test against a running server: node --env-file=.env scripts/smoke.mjs [baseUrl]
const base = process.argv[2] ?? "http://127.0.0.1:3000";
let failed = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
  if (!ok) failed++;
};

async function call(path, { method = "GET", body, cookie } = {}) {
  const res = await fetch(base + path, {
    method,
    redirect: "manual",
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  const setCookie = res.headers.getSetCookie?.().map((c) => c.split(";")[0]).join("; ");
  return { status: res.status, json, text, cookie: setCookie };
}

const login = async (email, password) => {
  const r = await call("/api/auth/login", { method: "POST", body: { email, password } });
  return r;
};

// 1. public pages and search
const halls = await call("/halls");
check("halls page", halls.status === 200 && halls.text.includes("/halls/"));
const slug = /href="\/halls\/([^"]+)"/.exec(halls.text)?.[1];
check("found a hall link", Boolean(slug), slug);
const hallPage = await call(`/halls/${slug}`);
check("hall page renders deposit form", hallPage.status === 200 && hallPage.text.includes("العربون"));
check("unknown hall is 404", (await call("/halls/does-not-exist")).status === 404);

// 2. protected routes
check("bookings API validates input", (await call("/api/bookings", { method: "POST", body: {} })).status === 422);
check("vendor API needs auth", (await call("/api/vendor/halls", { method: "POST", body: {} })).status === 401);
check("admin API needs auth", (await call("/api/admin/vendors/x", { method: "PATCH", body: {} })).status === 401);
check("wrong password rejected", (await login("vendor.riyadh@example.com", "wrong-password-x")).status === 401);

// 3. vendor journey
const v = await login("vendor.riyadh@example.com", process.env.DEMO_VENDOR_PASSWORD ?? "");
check("vendor login", v.status === 200 && v.json?.redirect === "/dashboard");
const dash = await call("/dashboard", { cookie: v.cookie });
check("dashboard renders for vendor", dash.status === 200 && dash.text.includes("لوحة"));

const created = await call("/api/vendor/halls", {
  method: "POST",
  cookie: v.cookie,
  body: {
    name: `قاعة الاختبار ${Date.now()}`,
    city: "الرياض",
    district: "حي النرجس",
    section: "BOTH",
    capacityMen: 300,
    capacityWomen: 300,
    basePrice: 20000,
    depositPercent: 25,
    description: "قاعة تجريبية أُنشئت أثناء الفحص الحي للمنصة.",
    amenities: "مواقف، تكييف",
    published: true,
  },
});
check("vendor creates hall", created.status === 201 || created.status === 200, String(created.status));
const hallId = created.json?.id ?? created.json?.hall?.id;
check("hall id returned", Boolean(hallId));

if (hallId) {
  const pkg = await call(`/api/vendor/halls/${hallId}/packages`, {
    method: "POST",
    cookie: v.cookie,
    body: { name: "ضيافة فاخرة", category: "CATERING", price: 5000, description: "بوفيه مفتوح" },
  });
  check("vendor adds package", pkg.status === 201 || pkg.status === 200, String(pkg.status));

  const date = new Date(Date.now() + 40 * 864e5).toISOString().slice(0, 10);
  const booking = await call("/api/bookings", {
    method: "POST",
    body: {
      hallId,
      date,
      eventType: "WEDDING",
      section: "MEN",
      guests: 200,
      customerName: "سارة الدوسري",
      customerPhone: "0551234567",
      packageIds: pkg.json?.id ? [pkg.json.id] : [],
    },
  });
  check("customer books", booking.status === 201 || booking.status === 200, String(booking.status));
  check("deposit is 25% of total", booking.json?.depositAmount === Math.round((booking.json?.totalAmount ?? 0) * 0.25), JSON.stringify({ t: booking.json?.totalAmount, d: booking.json?.depositAmount }));

  const dup = await call("/api/bookings", {
    method: "POST",
    body: { hallId, date, eventType: "WEDDING", section: "MEN", guests: 100, customerName: "خالد العتيبي", customerPhone: "0561234567" },
  });
  check("same day is held (second request allowed or blocked cleanly)", [201, 200, 409].includes(dup.status), String(dup.status));

  const bookingsPage = await call("/dashboard/bookings", { cookie: v.cookie });
  check("vendor sees request", bookingsPage.status === 200 && bookingsPage.text.includes("سارة الدوسري"));
  const bookingId = /data-booking-id="([^"]+)"/.exec(bookingsPage.text)?.[1] ?? booking.json?.id;
  if (bookingId) {
    const approve = await call(`/api/vendor/bookings/${bookingId}`, { method: "PATCH", cookie: v.cookie, body: { status: "CONFIRMED" } });
    check("vendor approves", approve.status === 200, String(approve.status));
    const after = await call("/api/bookings", {
      method: "POST",
      body: { hallId, date, eventType: "WEDDING", section: "MEN", guests: 100, customerName: "نورة القحطاني", customerPhone: "0571234567" },
    });
    check("confirmed date rejected", after.status === 409, String(after.status));
  }
}

// 4. admin journey
const a = await login(process.env.ADMIN_EMAIL ?? "", process.env.ADMIN_PASSWORD ?? "");
check("admin login", a.status === 200 && a.json?.redirect === "/admin");
const adminPage = await call("/admin", { cookie: a.cookie });
check("admin page renders", adminPage.status === 200);
check("vendor cannot reach admin API", (await call("/api/admin/vendors/x", { method: "PATCH", cookie: v.cookie, body: {} })).status === 403);

console.log(failed === 0 ? "SMOKE OK" : `SMOKE FAILED (${failed})`);
process.exit(failed === 0 ? 0 : 1);
