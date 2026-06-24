"use client";
import * as React from "react";
import type { DriverLocation } from "@eufraat/schemas";

// Leaflet wordt via dynamic import geladen zodat SSR niet crasht
// (Leaflet heeft 'window' nodig).
const Map = React.lazy(() => import("./DriverMapInner"));

export function DriverMap({ location, address }: { location: DriverLocation; address: string }) {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-64 items-center justify-center rounded-2xl bg-stone-100 text-sm text-stone-500">
          Kaart laden…
        </div>
      }
    >
      <Map location={location} address={address} />
    </React.Suspense>
  );
}
