import { CITIES, SECTION_LABEL } from "@/lib/format";
import type { HallSearch } from "@/lib/search";

export function HallSearchForm({ values, advanced = false }: { values?: Partial<HallSearch>; advanced?: boolean }) {
  return (
    <form action="/halls" method="get" className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4" role="search" aria-label="بحث عن قاعة">
      <div>
        <label htmlFor="f-city" className="label">
          المدينة
        </label>
        <select id="f-city" name="city" className="field" defaultValue={values?.city ?? ""}>
          <option value="">كل المدن</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-section" className="label">
          القسم
        </label>
        <select id="f-section" name="section" className="field" defaultValue={values?.section ?? ""}>
          <option value="">الكل</option>
          <option value="MEN">رجال</option>
          <option value="WOMEN">نساء</option>
          <option value="BOTH">{SECTION_LABEL.BOTH}</option>
        </select>
      </div>
      <div>
        <label htmlFor="f-capacity" className="label">
          عدد الحضور (على الأقل)
        </label>
        <input id="f-capacity" name="capacity" type="number" min={1} inputMode="numeric" className="field" defaultValue={values?.capacity ?? ""} />
      </div>
      <div>
        <label htmlFor="f-price" className="label">
          أعلى سعر (ر.س)
        </label>
        <input id="f-price" name="maxPrice" type="number" min={1} inputMode="numeric" className="field" defaultValue={values?.maxPrice ?? ""} />
      </div>
      {advanced && (
        <div>
          <label htmlFor="f-sort" className="label">
            الترتيب
          </label>
          <select id="f-sort" name="sort" className="field" defaultValue={values?.sort ?? "newest"}>
            <option value="newest">الأحدث</option>
            <option value="price_asc">السعر: الأقل أولاً</option>
            <option value="price_desc">السعر: الأعلى أولاً</option>
            <option value="capacity">الأكبر سعة</option>
          </select>
        </div>
      )}
      <div className={`flex items-end ${advanced ? "sm:col-span-1" : "sm:col-span-2 lg:col-span-4"}`}>
        <button type="submit" className="btn btn-primary w-full">
          ابحث عن قاعة
        </button>
      </div>
    </form>
  );
}
