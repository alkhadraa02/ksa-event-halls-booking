"use client";

import { useState } from "react";
import { dayState, isRequestable, type DayMarker, type DayState } from "@/lib/booking";
import { formatDateAr, monthGrid, monthLabel, parseKey, shiftMonth, WEEKDAYS_AR } from "@/lib/dates";

const STATE_LABEL: Record<DayState, string> = {
  available: "متاح",
  held: "عليه طلب قيد المراجعة",
  booked: "محجوز",
  blocked: "غير متاح",
  past: "منتهٍ",
};

const STATE_CLASS: Record<DayState, string> = {
  available: "bg-surface text-ink hover:bg-brand-soft",
  held: "bg-warn-soft text-warn",
  booked: "bg-bad-soft text-bad",
  blocked: "bg-surface-2 text-muted line-through",
  past: "bg-surface text-muted opacity-50",
};

type Props = {
  dayMap: Record<string, DayMarker>;
  today: string;
  selected?: string;
  /** When set, days become buttons. Return value of `canSelect` decides which. */
  onSelect?: (key: string) => void;
  canSelect?: (state: DayState) => boolean;
};

export function Calendar({ dayMap, today, selected, onSelect, canSelect = isRequestable }: Props) {
  const start = parseKey(selected && selected >= today ? selected : today);
  const [ym, setYm] = useState({ year: start.year, month0: start.month0 });
  const weeks = monthGrid(ym.year, ym.month0);
  const base = parseKey(today);
  const atMin = ym.year === base.year && ym.month0 === base.month0;

  return (
    <div className="card p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          aria-label="الشهر التالي"
          onClick={() => setYm(shiftMonth(ym, 1))}
        >
          <span aria-hidden="true">›</span>
        </button>
        <p className="font-bold" aria-live="polite">
          {monthLabel(ym.year, ym.month0)}
        </p>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          aria-label="الشهر السابق"
          disabled={atMin}
          onClick={() => setYm(shiftMonth(ym, -1))}
        >
          <span aria-hidden="true">‹</span>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted" aria-hidden="true">
        {WEEKDAYS_AR.map((d) => (
          <span key={d} className="truncate py-1">
            {d.replace("ال", "")}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1" role="grid" aria-label={`تقويم ${monthLabel(ym.year, ym.month0)}`}>
        {weeks.flat().map((key, i) => {
          if (!key) return <span key={`e${i}`} className="aspect-square" />;
          const state = dayState(key, today, dayMap);
          const label = `${formatDateAr(key)} — ${STATE_LABEL[state]}`;
          const cls = `flex aspect-square min-h-9 items-center justify-center rounded-lg border text-sm ${
            key === selected ? "border-brand ring-2 ring-brand" : "border-line"
          } ${STATE_CLASS[state]}`;
          const day = parseKey(key).day;
          if (onSelect && canSelect(state)) {
            return (
              <button
                key={key}
                type="button"
                className={`${cls} cursor-pointer font-semibold`}
                aria-label={label}
                aria-pressed={key === selected}
                onClick={() => onSelect(key)}
              >
                {day}
              </button>
            );
          }
          return (
            <span key={key} className={cls} role="gridcell" aria-label={label}>
              {day}
            </span>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted" aria-label="دليل الألوان">
        <Legend cls="bg-surface" text="متاح" />
        <Legend cls="bg-warn-soft" text="قيد المراجعة" />
        <Legend cls="bg-bad-soft" text="محجوز" />
        <Legend cls="bg-surface-2" text="غير متاح" />
      </ul>
    </div>
  );
}

function Legend({ cls, text }: { cls: string; text: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={`inline-block size-4 rounded border border-line ${cls}`} aria-hidden="true" />
      {text}
    </li>
  );
}
