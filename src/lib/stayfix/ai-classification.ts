import { CATEGORIES, PRIORITIES, type CategoryId, type PriorityId } from "./config";

export interface ValidatedAiClassification {
  category: CategoryId;
  priority: PriorityId;
  rationale: string;
}

const categoryIds = new Set<CategoryId>(CATEGORIES.map((item) => item.id));
const priorityIds = new Set<PriorityId>(PRIORITIES.map((item) => item.id));

const GAS_RISK_PATTERN = /\b(?:gas|olor\s+a\s+gas|huele(?:\s+\w+){0,3}\s+a\s+gas|fuga\s+de\s+gas|escape\s+de\s+gas|posible\s+fuga)\b/;

const normalizeDescription = (description: string) =>
  description.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();

function localClassification(description: string): ValidatedAiClassification {
  const text = normalizeDescription(description);
  const critical = /olor a gas|fuga de gas|posible fuga de gas|humo|incendio|fuego|peligro electrico grave|riesgo inmediato para personas|emergencia de seguridad/.test(text);

  if (critical && /gas/.test(text)) {
    return {
      category: "gas",
      priority: "critica",
      rationale: "El olor a gas puede indicar una fuga y representa un riesgo potencial para la seguridad de las personas.",
    };
  }

  if (critical) {
    return {
      category: /electrico/.test(text) ? "electricidad" : "otros",
      priority: "critica",
      rationale: "La descripción contiene señales de riesgo inmediato para personas o instalaciones y requiere atención urgente.",
    };
  }

  if (/puerta|abrir|llave|acceso|habitacion/.test(text)) {
    return {
      category: "acceso",
      priority: "alta",
      rationale: "El problema impide o dificulta el acceso a la habitación y requiere atención prioritaria.",
    };
  }

  if (/television|tv|electrodomestico|no enciende/.test(text)) {
    return {
      category: "electrodomesticos",
      priority: "media",
      rationale: "La descripción indica una incidencia de un electrodoméstico sin señales adicionales de riesgo crítico.",
    };
  }

  return {
    category: "mantenimiento",
    priority: "media",
    rationale: "La descripción corresponde a una incidencia general de mantenimiento sin señales de riesgo crítico.",
  };
}

function applySafetyOverrides(description: string, suggestion: ValidatedAiClassification): ValidatedAiClassification {
  const text = normalizeDescription(description);
    const hasGasRisk = GAS_RISK_PATTERN.test(text);
  const critical = hasGasRisk || /humo|incendio|fuego|peligro electrico grave|riesgo inmediato para personas|emergencia de seguridad/.test(text);
  if (!critical) return suggestion;

  return {
    ...suggestion,
    category: hasGasRisk ? "gas" : /electrico/.test(text) ? "electricidad" : suggestion.category,
    priority: "critica",
    rationale: hasGasRisk
      ? "El olor a gas puede indicar una fuga y representa un riesgo potencial para la seguridad de las personas."
      : "La descripción contiene señales de riesgo inmediato para personas o instalaciones y requiere atención urgente.",
  };
}


function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validates and normalizes the structured response returned by the AI service.
 * Invalid or out-of-catalog responses return null so the normal incident flow
 * can continue without trusting arbitrary model output.
 */
export async function requestAiClassification(description: string): Promise<ValidatedAiClassification | null> {
    const endpoint = import.meta.env.VITE_AI_CLASSIFICATION_URL;
  if (!endpoint) return localClassification(description);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ description }),
      signal: AbortSignal.timeout(8000),
    });
        if (!response.ok) return localClassification(description);
    const suggestion = parseAiClassification(await response.json());
    return suggestion ? applySafetyOverrides(description, suggestion) : localClassification(description);
  } catch {
    return localClassification(description);
  }
}

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
