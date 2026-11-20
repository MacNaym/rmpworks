"use client";
import { useEffect } from "react";

/** Anti-slop Tweaks Bar is enabled only in local development. */
export function DesignTweaks() {
 useEffect(() => {
  if (process.env.NODE_ENV === "production") return;
  if (document.querySelector('script[data-antislop-tweaks]')) return;
  const script = document.createElement("script");
  script.src = "/tweaks-bar.js";
  script.setAttribute("data-antislop-tweaks", "");
  document.body.appendChild(script);
  return () => { script.remove(); };
 }, []);
 return null;
}
