import { CATEGORIES } from "./config";
import type { Incident } from "./types";
import { ageMinutes, isOverdue, resolutionMinutes } from "./workflow";

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function computeMetrics(items: Incident[]) {
  const resolved = items.filter((i) => i.resolvedAt);
  const times = resolved.map((i) => resolutionMinutes(i)!);
  const open = items.filter((i) => !i.resolvedAt);
  const byCategory = CATEGORIES.map((c) => {
    const list = items.filter((i) => i.category === c.id);
    const r = list.filter((i) => i.resolvedAt);
    return {
      id: c.id, label: c.label, count: list.length,
      avg: avg(r.map((i) => resolutionMinutes(i)!)),
      withinPct: r.length ? (r.filter((i) => !isOverdue(i)).length / r.length) * 100 : null,
    };
  }).filter((c) => c.count > 0);
  return {
    total: items.length,
    open: open.length,
    resolved: resolved.length,
    avgResolution: avg(times),
    withinPct: resolved.length ? (resolved.filter((i) => !isOverdue(i)).length / resolved.length) * 100 : null,
    overdue: items.filter((i) => isOverdue(i)).length,
    byCategory,
    oldest: [...open].sort((a, b) => ageMinutes(b) - ageMinutes(a)).slice(0, 5),
    fastest: [...resolved].sort((a, b) => resolutionMinutes(a)! - resolutionMinutes(b)!).slice(0, 5),
  };
}
