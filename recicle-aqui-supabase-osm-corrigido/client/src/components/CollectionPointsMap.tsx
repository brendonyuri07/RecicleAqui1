import { useCallback, useEffect, useState } from "react";
import L from "leaflet";
import { MapView } from "@/components/Map";
import type { CollectionPoint } from "@/lib/domain";
import { statusLabel } from "@/lib/domain";

const colors: Record<CollectionPoint["capacityStatus"], string> = {
  ativo: "#22a06b",
  proximo: "#e0a82e",
  lotado: "#dc4034",
};

export default function CollectionPointsMap({
  points,
  selectedId,
}: {
  points: CollectionPoint[];
  selectedId?: number;
}) {
  const [map, setMap] = useState<L.Map | null>(null);
  const onMapReady = useCallback((nextMap: L.Map) => setMap(nextMap), []);

  useEffect(() => {
    if (!map) return;

    const validPoints = points.filter(
      point =>
        Number.isFinite(point.latitude) &&
        Number.isFinite(point.longitude) &&
        Math.abs(point.latitude) <= 90 &&
        Math.abs(point.longitude) <= 180
    );
    const markers = validPoints.map(point => {
      const marker = L.circleMarker([point.latitude, point.longitude], {
        radius: selectedId === point.id ? 12 : 9,
        color: "#ffffff",
        weight: 2,
        fillColor: colors[point.capacityStatus],
        fillOpacity: 1,
      }).addTo(map);

      marker.bindPopup(
        `<div style="min-width:185px;padding:2px"><strong>${escapeHtml(point.name)}</strong><br/><span>${escapeHtml(point.neighborhood)}</span><br/><span style="font-size:12px">${escapeHtml(point.address)}</span><br/><span style="font-size:12px">${escapeHtml(statusLabel[point.capacityStatus])}</span><br/><a href="/pontos/${point.id}" style="display:inline-block;margin-top:6px;color:var(--primary);font-weight:600">Ver detalhes →</a></div>`
      );
      return marker;
    });

    const selected = validPoints.findIndex(point => point.id === selectedId);
    if (selected >= 0) {
      map.setView(markers[selected].getLatLng(), 15);
      markers[selected].openPopup();
    } else if (markers.length) {
      map.fitBounds(L.featureGroup(markers).getBounds(), {
        padding: [24, 24],
        maxZoom: 15,
      });
    }
    return () => markers.forEach(marker => marker.remove());
  }, [map, points, selectedId]);

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-border bg-card">
      <MapView
        className="h-full"
        initialCenter={[-21.406, -48.505]}
        initialZoom={13}
        onMapReady={onMapReady}
      />
    </div>
  );
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    char =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        char
      ] ?? char
  );
}
