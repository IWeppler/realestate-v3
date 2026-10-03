"use server";

import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { supabaseAdmin, nextAgentForLead } from "@/lib/supabase-admin";
import { BRAND } from "@/lib/brand";
import { criteriaQuery, describeCriteria, pickCriteria } from "@/features/public/searchCriteria";

// Server Action pública (visitante anónimo): "Avisame cuando entre algo
// así". Guarda un lead con la búsqueda en la nota (criterios legibles y el
// link para reproducirla), así el asesor sabe qué ofrecerle cuando entre
// una propiedad que encaje. Usa service_role como los otros formularios
// públicos (ver createContactLeadAction); Zod es la única puerta de entrada.

const alertSchema = z.object({
  name: z.string().trim().min(3).max(120),
  phone: z.string().trim().min(8).max(40),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
});

type FormState = { success: boolean; message: string };

export async function createSearchAlertAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const t = await getTranslations("searchAlert.actions");
  const FAILED = t("failed");
  const validation = alertSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
  });
  if (!validation.success) {
    return { success: false, message: t("invalid") };
  }
  const { name, phone, email } = validation.data;

  // Los criterios llegan como campos "c_<clave>"; solo pasan las claves
  // conocidas del listado.
  const criteria = pickCriteria(
    Object.fromEntries(
      [...formData.entries()]
        .filter(([k]) => k.startsWith("c_"))
        .map(([k, v]) => [k.slice(2), typeof v === "string" ? v : ""]),
    ),
  );

  // Nombres de tipo y amenities para que la nota se lea sin ids.
  const [{ data: types }, { data: amenities }] = await Promise.all([
    supabaseAdmin.from("property_types").select("id, name"),
    supabaseAdmin.from("amenities").select("id, name"),
  ]);
  const lines = describeCriteria(criteria, types ?? [], amenities ?? []);
  const query = criteriaQuery(criteria);
  const notes = [
    "ALERTA DE BÚSQUEDA",
    lines.length ? lines.map((l) => `- ${l}`).join("\n") : "- Sin filtros (cualquier propiedad)",
    `Búsqueda: ${BRAND.siteUrl}/propiedades${query ? `?${query}` : ""}`,
  ].join("\n\n");

  const agentId = await nextAgentForLead();
  if (!agentId) {
    console.error("Alerta de búsqueda: no se pudo asignar un agente.");
    return { success: false, message: FAILED };
  }

  // La búsqueda también queda estructurada en el lead (Buyer Intelligence):
  // así el dashboard la cruza con propiedades nuevas sin leer la nota. Sin
  // "tipo" (comprar/alquilar) no hay demanda utilizable y solo queda la nota.
  const operation = criteria.tipo === "venta" || criteria.tipo === "alquiler" ? criteria.tipo : null;
  const typeId = Number(criteria.typeId);
  const atLeast = (v?: string) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
  };
  const demand = operation
    ? {
        search_operation: operation,
        search_type_ids: Number.isInteger(typeId) && typeId > 0 ? [typeId] : [],
        search_locations: (criteria.loc ?? "").split(",").map((s) => s.trim()).filter(Boolean),
        search_bedrooms_min: atLeast(criteria.bedrooms),
        search_bathrooms_min: atLeast(criteria.bathrooms),
        search_confirmed_at: new Date().toISOString(),
      }
    : {};

  const { error } = await supabaseAdmin.from("leads").insert({
    name,
    phone,
    email: email || null,
    notes,
    property_id: null,
    agent_id: agentId,
    status: "NUEVO",
    source: "ALERTA_BUSQUEDA",
    ...demand,
  });

  if (error) {
    console.error("Error al guardar la alerta de búsqueda:", error.message);
    return { success: false, message: FAILED };
  }

  return { success: true, message: t("success") };
}
