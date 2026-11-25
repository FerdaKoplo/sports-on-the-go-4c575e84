import { useCallback, useEffect, useRef } from "react";
import type L from "leaflet";
import { useDiscoverStore } from "@/stores/discoverStore";
import type { DiscoverGame } from "@/components/partials/discover/discover-types.props";

interface UseLeafletMapOptions {
  games: DiscoverGame[];
  filteredGames: DiscoverGame[];
  center: [number, number];
  zoom: number;
  loading: boolean;
  onSelectGame: (game: DiscoverGame) => void;
}

export const useLeafletMap = ({
  games,
  filteredGames,
  center,
  zoom,
  loading,
  onSelectGame,
}: UseLeafletMapOptions) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const setUserLocation = useDiscoverStore((s) => s.setUserLocation);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setUserLocation([coords.latitude, coords.longitude]),
      () => console.log("Location access denied or unavailable"),
    );
  }, [setUserLocation]);

  useEffect(() => {
    if (loading || typeof window === "undefined" || mapRef.current) return;

    let isCancelled = false;

    import("leaflet").then((Leaflet) => {
      if (isCancelled || mapRef.current) return;

      delete (
        Leaflet.Icon.Default.prototype as unknown as Record<string, unknown>
      )._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const instance = Leaflet.map("map").setView(center, zoom);
      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(instance);

      mapRef.current = instance;
    });

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading, center, zoom]);

  useEffect(() => {
    if (loading) return;

    import("leaflet").then((Leaflet) => {
      const map = mapRef.current;
      if (!map) return;

      Object.values(markersRef.current).forEach((m) => m.remove());
      const nextMarkers: Record<string, L.Marker> = {};

      games.forEach((game) => {
        const icon = Leaflet.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: 40px;
              height: 40px;
              background: #3b82f6;
              border: 3px solid #1e40af;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              cursor: pointer;
            ">
              ${game.emoji}
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        const marker = Leaflet.marker([game.lat, game.lng], { icon }).addTo(
          map,
        );
        marker.on("click", () => {
          onSelectGame(game);
          map.setView([game.lat, game.lng], 14);
        });

        nextMarkers[game.id] = marker;
      });

      markersRef.current = nextMarkers;
    });
  }, [games, loading, onSelectGame]);

  useEffect(() => {
    const filteredIds = new Set(filteredGames.map((g) => g.id));
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      marker.setOpacity(filteredIds.has(id) ? 1 : 0);
    });
  }, [filteredGames]);

  const focusLocation = useCallback((lat: number, lng: number, level = 14) => {
    mapRef.current?.setView([lat, lng], level);
  }, []);

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        setUserLocation([latitude, longitude]);

        const map = mapRef.current;
        if (!map) return;

        map.setView([latitude, longitude], 14);
        import("leaflet").then((Leaflet) => {
          Leaflet.marker([latitude, longitude], {
            icon: Leaflet.divIcon({
              className: "user-marker",
              html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  background: #ef4444;
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                "></div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            }),
          }).addTo(map);
        });
      },
      () => {
        alert("Unable to get your location. Please enable location services.");
      },
    );
  }, [setUserLocation]);

  return { focusLocation, locateMe };
};
