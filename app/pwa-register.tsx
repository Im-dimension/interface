'use client';

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const swUrl = "/sw.js";
    (async () => {
      try {
        const registration = await navigator.serviceWorker.register(swUrl, { scope: "/" });
        registration.onupdatefound = () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              // A new version is available; consider surfacing a UI to refresh
            }
          });
        };
      } catch {
        // ignore registration errors
      }
    })();
  }, []);

  return null;
}


