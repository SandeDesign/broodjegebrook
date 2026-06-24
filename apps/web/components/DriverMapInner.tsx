"use client";
import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { DriverLocation } from "@eufraat/schemas";
import "leaflet/dist/leaflet.css";

// Fix voor default marker-icons die in webpack/Next.js missen.
const driverIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:44px;height:44px;border-radius:50%;
    background:#c87a2b;border:4px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,.35);
    display:flex;align-items:center;justify-content:center;
    font-size:22px;
  ">🛵</div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -24],
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.panTo([lat, lng], { animate: true, duration: 0.8 });
  }, [map, lat, lng]);
  return null;
}

export default function DriverMapInner({
  location,
  address,
}: {
  location: DriverLocation;
  address: string;
}) {
  const updatedAgo = Math.round((Date.now() - new Date(location.at).getTime()) / 1000);
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={15}
        style={{ height: 280, width: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <Marker position={[location.lat, location.lng]} icon={driverIcon}>
          <Popup>Bezorger onderweg</Popup>
        </Marker>
        <RecenterMap lat={location.lat} lng={location.lng} />
      </MapContainer>
      <div className="flex items-center justify-between bg-white px-4 py-2 text-xs text-stone-500">
        <span>🛵 Bezorger onderweg naar {address}</span>
        <span>Locatie {updatedAgo < 60 ? `${updatedAgo}s` : `${Math.round(updatedAgo / 60)}m`} geleden</span>
      </div>
    </div>
  );
}
