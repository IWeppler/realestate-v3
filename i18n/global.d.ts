import type { routing } from "@/i18n/routing";
import type about from "@/messages/es-AR/about.json";
import type appraisal from "@/messages/es-AR/appraisal.json";
import type booking from "@/messages/es-AR/booking.json";
import type common from "@/messages/es-AR/common.json";
import type contact from "@/messages/es-AR/contact.json";
import type home from "@/messages/es-AR/home.json";
import type listing from "@/messages/es-AR/listing.json";
import type property from "@/messages/es-AR/property.json";
import type searchAlert from "@/messages/es-AR/searchAlert.json";
import type zones from "@/messages/es-AR/zones.json";

// Tipos de next-intl: el español es la fuente de verdad. t("clave") con una
// clave que no existe en messages/es-AR es un error de TypeScript. Que el
// portugués tenga las mismas claves lo controla scripts/check-messages.mjs.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: {
      common: typeof common;
      home: typeof home;
      about: typeof about;
      zones: typeof zones;
      listing: typeof listing;
      property: typeof property;
      contact: typeof contact;
      appraisal: typeof appraisal;
      searchAlert: typeof searchAlert;
      booking: typeof booking;
    };
  }
}
