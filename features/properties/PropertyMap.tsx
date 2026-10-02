"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Crosshair, Home } from "lucide-react";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  useMap,
} from "@/shared/components/ui/map";

type PropertyMapProps = {
  lat: number | null;
  lng: number | null;
  title: string;
};

const DEFAULT_ZOOM = 15;

function RecenterButton({ lat, lng }: { lat: number; lng: number }) {
  const t = useTranslations("property.location");
  const { map } = useMap();
  const recenter = useCallback(() => {
    map?.flyTo({ center: [lng, lat], zoom: DEFAULT_ZOOM, bearing: 0, pitch: 0, duration: 800 });
  }, [map, lat, lng]);

  return (
    <button
      type="button"
      onClick={recenter}
      aria-label={t("recenterAria")}
      className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
    >
      <Crosshair className="size-3.5" />
      {t("recenter")}
    </button>
  );
}

export default function PropertyMap({ lat, lng, title }: PropertyMapProps) {
  const t = useTranslations("property.location");
  const controls = useTranslations("common.map");
  // Textos del aviso de "gestos cooperativos": el mapa no roba el scroll de
  // la página; para hacer zoom con la rueda hace falta Ctrl/⌘, y en móvil
  // dos dedos.
  const mapLocale = {
    "Map.Title": controls("title"),
    "AttributionControl.ToggleAttribution": controls("toggleAttribution"),
    "CooperativeGesturesHandler.WindowsHelpText": t("gesturesWindows"),
    "CooperativeGesturesHandler.MacHelpText": t("gesturesMac"),
    "CooperativeGesturesHandler.MobileHelpText": t("gesturesMobile"),
  };
  if (typeof lat !== "number" || typeof lng !== "number") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
        {t("unavailable")}
      </div>
    );
  }

  return (
    <Map
      // El sitio público siempre es claro, aunque el panel haya quedado en oscuro.
      theme="light"
      center={[lng, lat]}
      zoom={DEFAULT_ZOOM}
      minZoom={4}
      maxZoom={19}
      cooperativeGestures
      locale={mapLocale}
      className="h-full w-full"
    >
      <MapMarker longitude={lng} latitude={lat} anchor="bottom">
        <MarkerContent>
          <span className="relative flex flex-col items-center">
            <span className="flex size-11 items-center justify-center rounded-full border-[3px] border-card bg-main text-primary-foreground shadow-[0_8px_20px_-6px_rgb(28_33_38/0.45)]">
              <Home className="size-5" aria-label={title} />
            </span>
            <span className="-mt-1 size-3 rotate-45 border-r-[3px] border-b-[3px] border-card bg-main" />
          </span>
        </MarkerContent>
        <MarkerPopup offset={52}>
          <div className="max-w-60 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-md">
            {title}
          </div>
        </MarkerPopup>
      </MapMarker>

      <RecenterButton lat={lat} lng={lng} />
      <MapControls position="top-right" showZoom showCompass showFullscreen labels={{ zoomIn: controls("zoomIn"), zoomOut: controls("zoomOut"), resetNorth: controls("resetNorth"), fullscreen: controls("fullscreen") }} />
    </Map>
  );
}
