import { CATEGORIES, PRIORITIES, type CategoryId, type PriorityId } from "./config";

export interface ValidatedAiClassification {
  category: CategoryId;
  priority: PriorityId;
  rationale: string;
}

const categoryIds = new Set<CategoryId>(CATEGORIES.map((item) => item.id));
const priorityIds = new Set<PriorityId>(PRIORITIES.map((item) => item.id));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validates and normalizes the structured response returned by the AI service.
 * Invalid or out-of-catalog responses return null so the normal incident flow
 * can continue without trusting arbitrary model output.
 */
export function parseAiClassification(payload: unknown): ValidatedAiClassification | null {
  let value = payload;

  if (typeof payload === "string") {
    try {
      value = JSON.parse(payload);
    } catch {
      return null;
    }
  }

  if (!isRecord(value)) return null;

  const category = value.category;
  const priority = value.priority;
  const reason = value.reason ?? value.rationale;

  if (
    typeof category !== "string" ||
    !categoryIds.has(category as CategoryId) ||
    typeof priority !== "string" ||
    !priorityIds.has(priority as PriorityId) ||
    typeof reason !== "string"
  ) {
    return null;
  }

  const rationale = reason.trim();
  if (!rationale || rationale.length > 500) return null;

  return {
    category: category as CategoryId,
    priority: priority as PriorityId,
    rationale,
  };
}
