"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { MAPBOX_TOKEN, POI_CATEGORIES } from "@/components/route-builder/RouteBuilder";

interface Position { coords: [number, number]; timestamp: number; elevation: number; }

export default function GPSRecorder() {
  const { token } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"searching" | "active" | "error">("searching");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [elevation, setElevation] = useState(0);
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const posRef = useRef(positions);
  const distRef = useRef(distance);
  const elevRef = useRef(elevation);
  const watchRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef(0);
  const userMarkerRef = useRef<any>(null);

  useEffect(() => { posRef.current = positions; }, [positions]);
  useEffect(() => { distRef.current = distance; }, [distance]);
  useEffect(() => { elevRef.current = elevation; }, [elevation]);

  // Load Mapbox
  useEffect(() => {
    if (!mapContainer.current) return;
    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js";
    script.onload = () => {
      const link = document.createElement("link");
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);

      const turfScript = document.createElement("script");
      turfScript.src = "https://cdn.jsdelivr.net/npm/@turf/turf@7/turf.min.js";
      turfScript.onload = () => initMap();
      document.head.appendChild(turfScript);
    };
    document.head.appendChild(script);
    return () => { if (mapRef.current) mapRef.current.remove(); };
  }, []);

  const initMap = () => {
    const mapboxgl = (window as any).mapboxgl;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [100.8825, 12.9236],
      zoom: 14, pitch: 45,
    });

    map.on("load", () => {
      map.addSource("mapbox-dem", { type: "raster-dem", url: "mapbox://mapbox.mapbox-terrain-dem-v1", tileSize: 512 });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
      map.addLayer({ id: "sky", type: "sky", paint: { "sky-type": "atmosphere", "sky-atmosphere-sun": [0.0, 90.0], "sky-atmosphere-sun-intensity": 15 } });

      map.addSource("route", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({ id: "route-line", type: "line", source: "route", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#3B7689", "line-width": 5, "line-opacity": 0.9 } });

      setMapLoaded(true);

      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          setCurrentPos(coords);
          setGpsStatus("active");
          map.flyTo({ center: coords, zoom: 15 });
          addUserMarker(map, coords);
        },
        () => setGpsStatus("error"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

    mapRef.current = map;
  };

  const addUserMarker = (map: any, coords: [number, number]) => {
    const mapboxgl = (window as any).mapboxgl;
    if (userMarkerRef.current) userMarkerRef.current.remove();
    const el = document.createElement("div");
    el.innerHTML = `<div style="width:20px;height:20px;background:#3B7689;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`;
    userMarkerRef.current = new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map);
  };

  const startRecording = () => {
    if (!currentPos) return;
    setIsRecording(true); setIsPaused(false);
    setPositions([{ coords: currentPos, timestamp: Date.now(), elevation: 0 }]);
    posRef.current = [{ coords: currentPos, timestamp: Date.now(), elevation: 0 }];
    setDistance(0); setDuration(0); setElevation(0);
    startTimeRef.current = Date.now();

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setCurrentPos(coords);
        if (mapRef.current) addUserMarker(mapRef.current, coords);

        const turf = (window as any).turf;
        const lastPos = posRef.current[posRef.current.length - 1];
        if (lastPos && turf) {
          const d = turf.distance(turf.point(lastPos.coords), turf.point(coords), { units: "kilometers" });
          if (d > 0.005) {
            const newPos: Position = { coords, timestamp: Date.now(), elevation: pos.coords.altitude || 0 };
            const newPositions = [...posRef.current, newPos];
            posRef.current = newPositions;
            setPositions(newPositions);
            setDistance(prev => { const nd = prev + d; distRef.current = nd; return nd; });

            const elev = pos.coords.altitude || 0;
            if (elev > lastPos.elevation) {
              setElevation(prev => { const ne = prev + (elev - lastPos.elevation); elevRef.current = ne; return ne; });
            }

            // Update map
            if (mapRef.current) {
              const allCoords = newPositions.map(p => p.coords);
              const src = mapRef.current.getSource("route");
              if (src) src.setData({ type: "FeatureCollection", features: [{ type: "Feature", geometry: { type: "LineString", coordinates: allCoords }, properties: {} }] });
              mapRef.current.easeTo({ center: coords, duration: 500 });
            }
          }
        }
      },
      () => setGpsStatus("error"),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
    );

    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false); setIsPaused(false);
    if (watchRef.current !== null) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (positions.length > 1) setShowSaveModal(true);
  };

  const pauseRecording = () => setIsPaused(!isPaused);

  const saveRecording = async () => {
    if (!title.trim() || positions.length < 2) return;
    setSaving(true);
    const geojson = { type: "Feature", geometry: { type: "LineString", coordinates: positions.map(p => p.coords) }, properties: {} };
    const res = await fetch("/api/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title, geojson: JSON.stringify(geojson), distanceKm: Math.round(distance * 100) / 100,
        durationMinutes: Math.round(duration / 60), elevationGain: Math.round(elevation),
        startLat: positions[0].coords[1], startLng: positions[0].coords[0],
        endLat: positions[positions.length - 1].coords[1], endLng: positions[positions.length - 1].coords[0],
        difficulty: "easy", bikeType: "any",
      }),
    });
    setSaving(false);
    if (res.ok) { window.location.href = "/dashboard/routes"; }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60); const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative h-[calc(100vh-2rem)] overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(59,118,137,0.1)" }}>
      <div ref={mapContainer} className="h-full w-full" />

      {/* GPS status */}
      <div className="absolute top-4 left-4 z-10 rounded-xl px-3 py-2 text-xs font-medium backdrop-blur" style={{
        backgroundColor: gpsStatus === "active" ? "rgba(104,181,155,0.9)" : gpsStatus === "error" ? "rgba(224,122,95,0.9)" : "rgba(232,184,109,0.9)",
        color: "white",
      }}>
        {gpsStatus === "active" ? "📡 GPS OK" : gpsStatus === "error" ? "❌ GPS Error" : "🔍 Searching..."}
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 items-center gap-6 rounded-2xl bg-white/95 px-6 py-3 backdrop-blur" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
        <div className="text-center"><p className="text-[10px]" style={{ color: "var(--secondary-text)" }}>Distance</p><p className="font-outfit text-lg font-bold" style={{ color: "var(--dark)" }}>{distance.toFixed(1)} km</p></div>
        <div className="h-8 w-px bg-gray-200" />
        <div className="text-center"><p className="text-[10px]" style={{ color: "var(--secondary-text)" }}>Duration</p><p className="font-outfit text-lg font-bold" style={{ color: "var(--dark)" }}>{formatTime(duration)}</p></div>
        <div className="h-8 w-px bg-gray-200" />
        <div className="text-center"><p className="text-[10px]" style={{ color: "var(--secondary-text)" }}>Elevation</p><p className="font-outfit text-lg font-bold" style={{ color: "var(--dark)" }}>{Math.round(elevation)}m</p></div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-3">
        {!isRecording ? (
          <button onClick={startRecording} disabled={gpsStatus !== "active"}
            className="flex items-center gap-2 rounded-full px-8 py-4 font-bold text-white shadow-lg disabled:opacity-50"
            style={{ backgroundColor: "#22c55e" }}>
            ▶ Start Recording
          </button>
        ) : (
          <>
            <button onClick={pauseRecording} className="flex items-center gap-2 rounded-full px-6 py-4 font-bold text-white shadow-lg" style={{ backgroundColor: isPaused ? "#22c55e" : "#f59e0b" }}>
              {isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>
            <button onClick={stopRecording} className="flex items-center gap-2 rounded-full px-6 py-4 font-bold text-white shadow-lg" style={{ backgroundColor: "#ef4444" }}>
              ⏹ Stop
            </button>
          </>
        )}
      </div>

      {/* Save modal */}
      {showSaveModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 className="font-outfit mb-4 text-xl font-bold" style={{ color: "var(--dark)" }}>Save your ride</h3>
            <div className="mb-4 grid grid-cols-3 gap-3 rounded-xl p-3" style={{ backgroundColor: "rgba(104,181,155,0.08)" }}>
              <div className="text-center"><p className="text-xs" style={{ color: "var(--secondary-text)" }}>Distance</p><p className="font-bold">{distance.toFixed(1)} km</p></div>
              <div className="text-center"><p className="text-xs" style={{ color: "var(--secondary-text)" }}>Duration</p><p className="font-bold">{formatTime(duration)}</p></div>
              <div className="text-center"><p className="text-xs" style={{ color: "var(--secondary-text)" }}>Elevation</p><p className="font-bold">{Math.round(elevation)}m</p></div>
            </div>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Route title *"
              className="mb-4 w-full rounded-lg border px-3 py-3 text-sm outline-none" style={{ borderColor: "rgba(59,118,137,0.2)" }} />
            <div className="flex gap-3">
              <button onClick={() => setShowSaveModal(false)} className="flex-1 rounded-xl py-3 text-sm font-medium" style={{ color: "var(--secondary-text)" }}>Discard</button>
              <button onClick={saveRecording} disabled={saving || !title.trim()}
                className="bg-gradient-movana flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50">
                {saving ? "Saving..." : "Save as draft"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
