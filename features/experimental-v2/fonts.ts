import localFont from "next/font/local";

// This experiment loads only the three weights it actually uses.
export const architectureDisplay = localFont({
  src: "../../app/fonts/site/ClashGrotesk-500.woff2",
  weight: "500",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const architectureBody = localFont({
  src: [
    { path: "../../app/fonts/site/GeneralSans-400.woff2", weight: "400", style: "normal" },
    { path: "../../app/fonts/site/GeneralSans-500.woff2", weight: "500", style: "normal" },
  ],
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});
