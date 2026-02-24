/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { LatLngExpression, Icon } from "leaflet";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Map ko bahar se control karne ke liye
function MapController({ controlRef }: { controlRef: any }) {
  const map = useMap();
  useEffect(() => {
    if (controlRef) {
      controlRef.current = {
        flyTo: (lat: number, lng: number) => {
          map.flyTo([lat, lng], 15, { animate: true, duration: 1.2 });
        },
      };
    }
  }, [map]);
  return null;
}

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position]);
  return null;
}

function MapView({
  position,
  onPositionChange,
  mapControlRef,
}: {
  position: [number, number] | null;
  onPositionChange: (lat: number, lng: number) => void;
  mapControlRef: any;
}) {
  const markerRef = useRef<any>(null);

  if (!position) return null;

  return (
    <MapContainer
      center={position as LatLngExpression}
      zoom={13}
      scrollWheelZoom={false}
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController controlRef={mapControlRef} />
      <RecenterMap position={position} />
      <Marker
        position={position as LatLngExpression}
        icon={defaultIcon}
        draggable={true}
        ref={markerRef}
        eventHandlers={{
          dragend() {
            const marker = markerRef.current;
            if (marker) {
              const { lat, lng } = marker.getLatLng();
              onPositionChange(lat, lng);
            }
          },
        }}
      >
        <Popup>
          Drag karke exact location set karo.<br />
          Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default MapView;