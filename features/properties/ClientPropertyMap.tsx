"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";

function MapLoading() {
  const t = useTranslations("property.location");
  return <div className="h-full w-full animate-pulse bg-muted" aria-label={t("loadingMap")} />;
}

const DynamicPropertyMap = dynamic(
  () => import("@/features/properties/PropertyMap").then((mod) => mod.default),
  {
    loading: () => <MapLoading />,
    ssr: false,
  }
);

type ClientPropertyMapProps = {
  lat: number | null;
  lng: number | null;
  title: string;
};

export function ClientPropertyMap({ lat, lng, title }: ClientPropertyMapProps) {
  const t = useTranslations("property.location");
  if (typeof lat !== "number" || typeof lng !== "number") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-muted p-6 text-center text-muted-foreground">
        <MapPin size={32} className="mb-2 opacity-60" aria-hidden="true" />
        <p>{t("unavailableLong")}</p>
      </div>
    );
  }

  return <DynamicPropertyMap lat={lat} lng={lng} title={title} />;
}
