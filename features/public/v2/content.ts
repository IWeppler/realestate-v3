// Los textos viven en messages/<idioma>: acá solo van las claves, en el
// orden en que se muestran.

// DATOS DE EJEMPLO. Cifras y testimonios inventados para la demo de la
// landing (home.trust); reemplazar por datos reales de la inmobiliaria
// antes de publicar.
export const STATS = ["years", "deals", "saleTime"] as const;

export const TESTIMONIALS = ["sale", "purchase", "owner"] as const;

// Textos en common.appraisalSteps (los usan /tasar y AppraisalBand, que
// siguen leyendo estos datos hasta su migración).
export const APPRAISAL_STEPS = ["tell", "visit", "report"] as const; // textos: common.appraisalSteps

// Cómo trabaja la inmobiliaria (página Nosotros, about.values). TEXTO DE
// EJEMPLO: reemplazar por la propuesta real de cada inmobiliaria.
export const VALUES = ["respond", "data", "support"] as const;
