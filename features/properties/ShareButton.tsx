"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Check, Link as LinkIcon, Share2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { BRAND } from "@/lib/brand";

interface ShareButtonProps {
  title: string;
  price?: string;
  location?: string;
  url?: string;
}

// E2.1: un solo botón "Compartir". En dispositivos con Web Share API
// (móvil) abre la hoja nativa -- WhatsApp, Instagram, etc. -- con el
// texto armado; en escritorio abre un menú: WhatsApp Web / copiar link.
// La tarjeta rica (foto, precio) la aporta la OG image dinámica de
// /propiedades/[slug]/opengraph-image.tsx, no este componente.
export function ShareButton({ title, price, location, url }: ShareButtonProps) {
  const t = useTranslations("property.share");
  const [copied, setCopied] = useState(false);
  // Se resuelve con useSyncExternalStore para no desincronizar la
  // hidratación: en servidor (snapshot false) no existe navigator.
  const canNativeShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === "function",
    () => false
  );

  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const shareText = [
    `*${title}*`,
    [price, location].filter(Boolean).join(" · "),
    "",
    t("message", { brand: BRAND.name }),
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t("copiedToast"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyError"));
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleNativeShare = async () => {
    if (typeof navigator === "undefined" || !navigator.share) return false;
    try {
      await navigator.share({ title, text: shareText, url: shareUrl });
    } catch {
      // Cancelado por el usuario: no es un error.
    }
    return true;
  };

  if (canNativeShare) {
    return (
      <Button variant="outline" className="h-10 cursor-pointer gap-2 rounded-full border-border-strong bg-card px-4 text-sm font-medium text-foreground shadow-none hover:border-foreground hover:bg-card" onClick={handleNativeShare}>
        <Share2 className="h-4 w-4" aria-hidden="true" />
        {t("share")}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 cursor-pointer gap-2 rounded-full border-border-strong bg-card px-4 text-sm font-medium text-foreground shadow-none hover:border-foreground hover:bg-card">
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Share2 className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? t("copied") : t("share")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl p-1">
        <DropdownMenuItem onClick={handleWhatsApp} className="cursor-pointer rounded-lg py-2">
          <FaWhatsapp className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("whatsapp")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer rounded-lg py-2">
          <LinkIcon className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("copyLink")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
