"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ToolBar } from "./ToolBar";
import { RoutePanel } from "./RoutePanel";
import { PoiModal } from "./PoiModal";
import { StatsBar } from "./StatsBar";
import { Toast } from "./Toast";

// Types
export interface RoutePoint {
  lng: number;
  lat: number;
}

export interface PoiData {
  id: string;
  name: string;
  description: string;
  category: string;
  lat: number;
  lng: number;
  distanceFromStartKm?: number;
  estimatedDurationMin?: number;
  tips?: string;
  priceRange?: string;
  openingHours?: string;
  isHighlight: boolean;
  sortOrder: number;
  photoUrl?: string;
  marker?: any; // mapboxgl.Marker
}

export interface RouteStats {
  distance: number; // km
  duration: number; // minutes
  elevationGain: number; // meters
  pointCount: number;
}

interface RouteBuilderProps {
  routeId?: string;
  initialData?: {
    title: string;
    description: string;
    geojson: any;
    pois: PoiData[];
    difficulty: string;
    bikeType: string;
    regionId: string;
    coverUrl: string;
  };
}

const MAPBOX_TOKEN = "pk.eyJ1IjoiZnJlZXJpZGV0aGFpbGFuZCIsImEiOiJjbTRxYTVjZ2gwMXd3Mmtyc3g5MjhkbWk2In0.OPMYD7Mfa12PD-fNfVN3cA";

const POI_CATEGORIES = [
  { id: "cafe", label: "Café", icon: "☕", color: "#E8B86D" },
  { id: "restaurant", label: "Restaurant", icon: "🍜", color: "#E07A5F" },
  { id: "temple", label: "Temple", icon: "🛕", color: "#E8B86D" },
  { id: "viewpoint", label: "Viewpoint", icon: "👁", color: "#3B7689" },
  { id: "beach", label: "Beach", icon: "🏖", color: "#68B59B" },
  { id: "market", label: "Market", icon: "🛒", color: "#E07A5F" },
  { id: "museum", label: "Museum", icon: "🏛", color: "#3B7689" },
  { id: "park", label: "Park", icon: "🌳", color: "#92D99E" },
  { id: "shop", label: "Shop", icon: "🛍", color: "#E8B86D" },
  { id: "hotel", label: "Hotel", icon: "🏨", color: "#3B7689" },
  { id: "other", label: "Other", icon: "📍", color: "#5E726E" },
];

export { POI_CATEGORIES, MAPBOX_TOKEN };

export default function RouteBuilder({ routeId, initialData }: RouteBuilderProps) {
  const { token } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // State
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeTool, setActiveTool] = useState<"draw" | "poi" | "eraser" | "pan">("draw");
  const [snapToRoad, setSnapToRoad] = useState(true);
  const [is3D, setIs3D] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [waypoints, setWaypoints] = useState<RoutePoint[]>([]);
  const [snappedGeojson, setSnappedGeojson] = useState<any>(null);
  const [pois, setPois] = useState<PoiData[]>(initialData?.pois || []);
  const [pendingPoiCoords, setPendingPoiCoords] = useState<RoutePoint | null>(null);
  const [editingPoi, setEditingPoi] = useState<PoiData | null>(null);
  const [stats, setStats] = useState<RouteStats>({ distance: 0, duration: 0, elevationGain: 0, pointCount: 0 });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [saving, setSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Route form data
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "easy");
  const [bikeType, setBikeType] = useState(initialData?.bikeType || "any");
  const [regionId, setRegionId] = useState(initialData?.regionId || "");
  const [coverUrl, setCoverUrl] = useState(initialData?.coverUrl || "");

  // Refs for closures
  const waypointsRef = useRef(waypoints);
  const activeToolRef = useRef(activeTool);
  const snapRef = useRef(snapToRoad);
  const poisRef = useRef(pois);
  const markersRef = useRef<any[]>([]);

  useEffect(() => { waypointsRef.current = waypoints; }, [waypoints]);
  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  useEffect(() => { snapRef.current = snapToRoad; }, [snapToRoad]);
  useEffect(() => { poisRef.current = pois; }, [pois]);

  // Show toast
  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js";
    script.onload = () => {
      const link = document.createElement("link");
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);

      // Also load Turf.js
      const turfScript = document.createElement("script");
      turfScript.src = "https://cdn.jsdelivr.net/npm/@turf/turf@7/turf.min.js";
      turfScript.onload = () => initMap();
      document.head.appendChild(turfScript);
    };
    document.head.appendChild(script);

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  const initMap = () => {
    const mapboxgl = (window as any).mapboxgl;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [100.8825, 12.9236], // Jomtien default
      zoom: 13,
      pitch: 0,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "top-right"
    );

    map.on("load", () => {
      // Route source - raw waypoints line
      map.addSource("raw-route", {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: [] }, properties: {} },
      });
      map.addLayer({
        id: "raw-route-line",
        type: "line",
        source: "raw-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#FF6B5E", "line-width": 2, "line-opacity": 0.3, "line-dasharray": [2, 2] },
      });

      // Snapped route
      map.addSource("snapped-route", {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: [] }, properties: {} },
      });
      map.addLayer({
        id: "snapped-route-line",
        type: "line",
        source: "snapped-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#3B7689",
          "line-width": 5,
          "line-opacity": 0.9,
        },
      });

      // Waypoint dots
      map.addSource("waypoint-dots", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "waypoint-dots-layer",
        type: "circle",
        source: "waypoint-dots",
        paint: {
          "circle-radius": 6,
          "circle-color": "#3B7689",
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 2,
        },
      });

      // Start/End markers source
      map.addSource("start-end", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      setMapLoaded(true);

      // Load initial data if editing
      if (initialData?.geojson) {
        try {
          const geo = typeof initialData.geojson === "string" ? JSON.parse(initialData.geojson) : initialData.geojson;
          if (geo.geometry?.coordinates?.length) {
            const coords = geo.geometry.coordinates;
            const pts = coords.map((c: number[]) => ({ lng: c[0], lat: c[1] }));
            setWaypoints(pts);
            waypointsRef.current = pts;
            updateMapRoute(map, pts, geo);

            // Fit bounds
            const bounds = coords.reduce(
              (b: any, c: number[]) => b.extend(c),
              new mapboxgl.LngLatBounds(coords[0], coords[0])
            );
            map.fitBounds(bounds, { padding: 80 });
          }
        } catch {}
      }
    });

    // Click handler
    map.on("click", (e: any) => {
      const tool = activeToolRef.current;
      const coords = { lng: e.lngLat.lng, lat: e.lngLat.lat };

      if (tool === "draw") {
        addWaypoint(map, coords);
      } else if (tool === "poi") {
        setPendingPoiCoords(coords);
      } else if (tool === "eraser") {
        removeNearestWaypoint(map, coords);
      }
    });

    // Cursor
    map.on("mousemove", () => {
      const tool = activeToolRef.current;
      map.getCanvas().style.cursor =
        tool === "draw" ? "crosshair" : tool === "poi" ? "cell" : tool === "eraser" ? "not-allowed" : "grab";
    });

    mapRef.current = map;
  };

  // Add waypoint
  const addWaypoint = async (map: any, coords: RoutePoint) => {
    const newWaypoints = [...waypointsRef.current, coords];
    setWaypoints(newWaypoints);
    waypointsRef.current = newWaypoints;

    // Update raw line
    updateRawRoute(map, newWaypoints);

    // If snap enabled and >= 2 points, call Map Matching
    if (snapRef.current && newWaypoints.length >= 2) {
      await snapRoute(map, newWaypoints);
    } else {
      updateMapRoute(map, newWaypoints, null);
    }
  };

  // Remove nearest waypoint
  const removeNearestWaypoint = async (map: any, coords: RoutePoint) => {
    const pts = waypointsRef.current;
    if (pts.length === 0) return;

    let minDist = Infinity;
    let minIdx = 0;
    pts.forEach((p, i) => {
      const d = Math.sqrt((p.lng - coords.lng) ** 2 + (p.lat - coords.lat) ** 2);
      if (d < minDist) {
        minDist = d;
        minIdx = i;
      }
    });

    // Only remove if close enough (< ~500m at equator)
    if (minDist > 0.005) return;

    const newWaypoints = pts.filter((_, i) => i !== minIdx);
    setWaypoints(newWaypoints);
    waypointsRef.current = newWaypoints;

    updateRawRoute(map, newWaypoints);

    if (snapRef.current && newWaypoints.length >= 2) {
      await snapRoute(map, newWaypoints);
    } else {
      updateMapRoute(map, newWaypoints, null);
    }
  };

  // Update raw route display
  const updateRawRoute = (map: any, pts: RoutePoint[]) => {
    const coords = pts.map((p) => [p.lng, p.lat]);
    const source = map.getSource("raw-route");
    if (source) {
      source.setData({
        type: "Feature",
        geometry: { type: "LineString", coordinates: coords },
        properties: {},
      });
    }

    // Waypoint dots
    const dotSource = map.getSource("waypoint-dots");
    if (dotSource) {
      dotSource.setData({
        type: "FeatureCollection",
        features: coords.map((c) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: c },
          properties: {},
        })),
      });
    }
  };

  // Snap to road via Mapbox Map Matching API
  const snapRoute = async (map: any, pts: RoutePoint[]) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Map Matching API accepts max 100 coordinates
      const coords = pts.map((p) => [p.lng, p.lat]);
      const chunks: number[][][] = [];

      for (let i = 0; i < coords.length; i += 99) {
        chunks.push(coords.slice(i, i + 100));
      }

      let allSnapped: number[][] = [];

      for (const chunk of chunks) {
        const coordsString = chunk.map((c) => c.join(",")).join(";");
        const radiuses = chunk.map(() => "25").join(";");

        const url = `https://api.mapbox.com/matching/v5/mapbox/cycling/${coordsString}?access_token=${MAPBOX_TOKEN}&geometries=geojson&radiuses=${radiuses}&overview=full&tidy=true`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.code === "Ok" && data.matchings?.length > 0) {
          const snappedCoords = data.matchings[0].geometry.coordinates;
          if (allSnapped.length > 0) {
            // Skip first point to avoid duplication
            allSnapped = [...allSnapped, ...snappedCoords.slice(1)];
          } else {
            allSnapped = snappedCoords;
          }
        } else {
          // Fallback: use raw coords for this chunk
          allSnapped = [...allSnapped, ...chunk];
        }
      }

      if (allSnapped.length >= 2) {
        const geojson = {
          type: "Feature",
          geometry: { type: "LineString", coordinates: allSnapped },
          properties: {},
        };
        setSnappedGeojson(geojson);
        updateMapRoute(map, pts, geojson);
      }
    } catch (err) {
      console.error("Map Matching error:", err);
      showToast("Could not snap to roads", "error");
      updateMapRoute(map, pts, null);
    }

    setIsProcessing(false);
  };

  // Update map route display + stats
  const updateMapRoute = (map: any, pts: RoutePoint[], geojson: any) => {
    const turf = (window as any).turf;

    // Use snapped if available, otherwise raw line
    const routeGeojson = geojson || {
      type: "Feature",
      geometry: { type: "LineString", coordinates: pts.map((p) => [p.lng, p.lat]) },
      properties: {},
    };

    const source = map.getSource("snapped-route");
    if (source) {
      source.setData(routeGeojson);
    }

    // Calculate stats
    if (routeGeojson.geometry.coordinates.length >= 2 && turf) {
      const distance = turf.length(routeGeojson, { units: "kilometers" });
      // Estimate duration: avg 15 km/h cycling
      const duration = Math.round((distance / 15) * 60);

      setStats({
        distance: Math.round(distance * 100) / 100,
        duration,
        elevationGain: 0, // Would need elevation API
        pointCount: pts.length,
      });
    } else {
      setStats({ distance: 0, duration: 0, elevationGain: 0, pointCount: pts.length });
    }

    // Start/End markers
    if (pts.length >= 1) {
      updateStartEndMarkers(map, pts);
    }
  };

  // Start/End markers
  const updateStartEndMarkers = (map: any, pts: RoutePoint[]) => {
    const mapboxgl = (window as any).mapboxgl;

    // Remove existing
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (pts.length >= 1) {
      // Start marker
      const startEl = document.createElement("div");
      startEl.innerHTML = `<div style="width:28px;height:28px;background:#68B59B;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
        <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </div>`;
      const startMarker = new mapboxgl.Marker({ element: startEl }).setLngLat([pts[0].lng, pts[0].lat]).addTo(map);
      markersRef.current.push(startMarker);
    }

    if (pts.length >= 2) {
      // End marker
      const last = pts[pts.length - 1];
      const endEl = document.createElement("div");
      endEl.innerHTML = `<div style="width:28px;height:28px;background:#E07A5F;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
        <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
      </div>`;
      const endMarker = new mapboxgl.Marker({ element: endEl }).setLngLat([last.lng, last.lat]).addTo(map);
      markersRef.current.push(endMarker);
    }
  };

  // Add POI marker on map
  const addPoiMarkerOnMap = useCallback(
    (poi: PoiData) => {
      if (!mapRef.current) return;
      const mapboxgl = (window as any).mapboxgl;
      const cat = POI_CATEGORIES.find((c) => c.id === poi.category) || POI_CATEGORIES[POI_CATEGORIES.length - 1];

      const el = document.createElement("div");
      el.innerHTML = `<div style="width:32px;height:32px;background:white;border-radius:50%;border:2px solid ${cat.color};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);cursor:pointer;font-size:16px" title="${poi.name}">
        ${cat.icon}
      </div>`;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setEditingPoi(poi);
      });

      const marker = new mapboxgl.Marker({ element: el, draggable: true })
        .setLngLat([poi.lng, poi.lat])
        .addTo(mapRef.current);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        setPois((prev) =>
          prev.map((p) => (p.id === poi.id ? { ...p, lng: lngLat.lng, lat: lngLat.lat } : p))
        );
      });

      return marker;
    },
    []
  );

  // Handle POI save from modal
  const handlePoiSave = useCallback(
    (poiData: Partial<PoiData>) => {
      if (editingPoi) {
        // Update existing
        setPois((prev) =>
          prev.map((p) => (p.id === editingPoi.id ? { ...p, ...poiData } : p))
        );
        setEditingPoi(null);
        showToast("POI updated", "success");
      } else if (pendingPoiCoords) {
        // Create new
        const newPoi: PoiData = {
          id: crypto.randomUUID(),
          name: poiData.name || "Unnamed POI",
          description: poiData.description || "",
          category: poiData.category || "other",
          lat: pendingPoiCoords.lat,
          lng: pendingPoiCoords.lng,
          isHighlight: poiData.isHighlight || false,
          sortOrder: pois.length,
          tips: poiData.tips,
          priceRange: poiData.priceRange,
          openingHours: poiData.openingHours,
          photoUrl: poiData.photoUrl,
        };
        setPois((prev) => [...prev, newPoi]);
        addPoiMarkerOnMap(newPoi);
        setPendingPoiCoords(null);
        showToast("POI added", "success");
      }
    },
    [editingPoi, pendingPoiCoords, pois, addPoiMarkerOnMap, showToast]
  );

  // Delete POI
  const handlePoiDelete = useCallback(
    (poiId: string) => {
      setPois((prev) => prev.filter((p) => p.id !== poiId));
      setEditingPoi(null);
      showToast("POI deleted", "success");
    },
    [showToast]
  );

  // Re-add POI markers when pois change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    // We only add new ones; existing are managed via draggable markers
    // This is simplified - in production you'd track marker references
  }, [pois, mapLoaded]);

  // Toggle 3D
  const toggle3D = useCallback(() => {
    if (!mapRef.current) return;
    const newIs3D = !is3D;
    setIs3D(newIs3D);
    mapRef.current.easeTo({ pitch: newIs3D ? 60 : 0, bearing: newIs3D ? -30 : 0, duration: 1000 });
  }, [is3D]);

  // Toggle satellite
  const toggleSatellite = useCallback(() => {
    if (!mapRef.current) return;
    const newSat = !isSatellite;
    setIsSatellite(newSat);
    mapRef.current.setStyle(
      newSat ? "mapbox://styles/mapbox/satellite-streets-v12" : "mapbox://styles/mapbox/outdoors-v12"
    );

    // Re-add sources after style change
    mapRef.current.once("style.load", () => {
      const map = mapRef.current;
      // Raw route
      if (!map.getSource("raw-route")) {
        map.addSource("raw-route", { type: "geojson", data: { type: "Feature", geometry: { type: "LineString", coordinates: [] }, properties: {} } });
        map.addLayer({ id: "raw-route-line", type: "line", source: "raw-route", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#FF6B5E", "line-width": 2, "line-opacity": 0.3, "line-dasharray": [2, 2] } });
      }
      if (!map.getSource("snapped-route")) {
        map.addSource("snapped-route", { type: "geojson", data: { type: "Feature", geometry: { type: "LineString", coordinates: [] }, properties: {} } });
        map.addLayer({ id: "snapped-route-line", type: "line", source: "snapped-route", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#3B7689", "line-width": 5, "line-opacity": 0.9 } });
      }
      if (!map.getSource("waypoint-dots")) {
        map.addSource("waypoint-dots", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({ id: "waypoint-dots-layer", type: "circle", source: "waypoint-dots", paint: { "circle-radius": 6, "circle-color": "#3B7689", "circle-stroke-color": "#fff", "circle-stroke-width": 2 } });
      }

      // Restore route
      const pts = waypointsRef.current;
      if (pts.length > 0) {
        updateRawRoute(map, pts);
        const geo = snappedGeojson || { type: "Feature", geometry: { type: "LineString", coordinates: pts.map(p => [p.lng, p.lat]) }, properties: {} };
        const src = map.getSource("snapped-route");
        if (src) src.setData(geo);
        updateStartEndMarkers(map, pts);
      }

      // Re-add POI markers
      poisRef.current.forEach((poi) => addPoiMarkerOnMap(poi));
    });
  }, [isSatellite, snappedGeojson, addPoiMarkerOnMap]);

  // Undo last waypoint
  const undoWaypoint = useCallback(async () => {
    const map = mapRef.current;
    if (!map || waypointsRef.current.length === 0) return;

    const newWaypoints = waypointsRef.current.slice(0, -1);
    setWaypoints(newWaypoints);
    waypointsRef.current = newWaypoints;

    updateRawRoute(map, newWaypoints);

    if (newWaypoints.length >= 2 && snapRef.current) {
      await snapRoute(map, newWaypoints);
    } else {
      updateMapRoute(map, newWaypoints, null);
    }
  }, []);

  // Clear all
  const clearRoute = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    setWaypoints([]);
    waypointsRef.current = [];
    setSnappedGeojson(null);
    setStats({ distance: 0, duration: 0, elevationGain: 0, pointCount: 0 });

    // Clear markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Clear map sources
    const rawSrc = map.getSource("raw-route");
    if (rawSrc) rawSrc.setData({ type: "Feature", geometry: { type: "LineString", coordinates: [] }, properties: {} });
    const snapSrc = map.getSource("snapped-route");
    if (snapSrc) snapSrc.setData({ type: "Feature", geometry: { type: "LineString", coordinates: [] }, properties: {} });
    const dotSrc = map.getSource("waypoint-dots");
    if (dotSrc) dotSrc.setData({ type: "FeatureCollection", features: [] });

    showToast("Route cleared", "info");
  }, [showToast]);

  // Import GPX
  const importGPX = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "application/xml");

        const trkpts = xml.querySelectorAll("trkpt");
        if (trkpts.length === 0) {
          showToast("No track points found in GPX", "error");
          return;
        }

        const pts: RoutePoint[] = [];
        // Sample every Nth point to stay under Map Matching limit
        const step = Math.max(1, Math.floor(trkpts.length / 95));

        trkpts.forEach((pt, i) => {
          if (i % step === 0 || i === trkpts.length - 1) {
            const lat = parseFloat(pt.getAttribute("lat") || "0");
            const lng = parseFloat(pt.getAttribute("lon") || "0");
            if (lat && lng) pts.push({ lat, lng });
          }
        });

        setWaypoints(pts);
        waypointsRef.current = pts;

        const map = mapRef.current;
        if (!map) return;

        updateRawRoute(map, pts);

        if (snapRef.current && pts.length >= 2) {
          await snapRoute(map, pts);
        } else {
          updateMapRoute(map, pts, null);
        }

        // Fit bounds
        const mapboxgl = (window as any).mapboxgl;
        const coords = pts.map((p) => [p.lng, p.lat]);
        const bounds = coords.reduce(
          (b: any, c: number[]) => b.extend(c),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );
        map.fitBounds(bounds, { padding: 80 });

        showToast(`Imported ${pts.length} points from GPX`, "success");
      } catch {
        showToast("Failed to parse GPX file", "error");
      }
    };
    reader.readAsText(file);
  }, [showToast]);

  // Save route
  const saveRoute = useCallback(
    async (status: "draft" | "published" = "draft") => {
      if (!title.trim()) {
        showToast("Title is required", "error");
        return;
      }
      if (waypoints.length < 2) {
        showToast("Add at least 2 points to the route", "error");
        return;
      }

      setSaving(true);

      const geojson = snappedGeojson || {
        type: "Feature",
        geometry: { type: "LineString", coordinates: waypoints.map((p) => [p.lng, p.lat]) },
        properties: {},
      };

      const startCoords = waypoints[0];
      const endCoords = waypoints[waypoints.length - 1];

      const routePayload = {
        title,
        description,
        difficulty,
        bikeType,
        regionId: regionId || undefined,
        coverUrl: coverUrl || undefined,
        geojson: JSON.stringify(geojson),
        startLat: startCoords.lat,
        startLng: startCoords.lng,
        endLat: endCoords.lat,
        endLng: endCoords.lng,
        distanceKm: stats.distance,
        durationMinutes: stats.duration,
        elevationGain: stats.elevationGain,
        status,
      };

      try {
        const method = routeId ? "PUT" : "POST";
        const url = routeId ? `/api/routes/${routeId}` : "/api/routes";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(routePayload),
        });

        const data = await res.json();

        if (!res.ok) {
          showToast(data.error || "Failed to save route", "error");
          setSaving(false);
          return;
        }

        const savedRouteId = routeId || data.id;

        // Save POIs
        if (pois.length > 0) {
          await fetch(`/api/routes/${savedRouteId}/pois`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ pois }),
          });
        }

        showToast(
          status === "published" ? "Route published!" : "Route saved as draft",
          "success"
        );

        // Redirect after short delay
        setTimeout(() => {
          window.location.href = "/dashboard/routes";
        }, 1500);
      } catch {
        showToast("Network error", "error");
      }

      setSaving(false);
    },
    [title, description, difficulty, bikeType, regionId, coverUrl, waypoints, snappedGeojson, stats, pois, routeId, token, showToast]
  );

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-0 overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(59,118,137,0.1)" }}>
      {/* Map */}
      <div className="relative flex-1">
        <div ref={mapContainer} className="h-full w-full" />

        {/* Toolbar overlay */}
        <ToolBar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          snapToRoad={snapToRoad}
          setSnapToRoad={setSnapToRoad}
          is3D={is3D}
          toggle3D={toggle3D}
          isSatellite={isSatellite}
          toggleSatellite={toggleSatellite}
          undoWaypoint={undoWaypoint}
          clearRoute={clearRoute}
          importGPX={importGPX}
          isProcessing={isProcessing}
        />

        {/* Stats bar */}
        <StatsBar stats={stats} />

        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>

      {/* Side panel */}
      <RoutePanel
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        bikeType={bikeType}
        setBikeType={setBikeType}
        regionId={regionId}
        setRegionId={setRegionId}
        coverUrl={coverUrl}
        setCoverUrl={setCoverUrl}
        pois={pois}
        onPoiEdit={setEditingPoi}
        onPoiDelete={handlePoiDelete}
        saving={saving}
        onSaveDraft={() => saveRoute("draft")}
        onPublish={() => saveRoute("published")}
      />

      {/* POI Modal */}
      {(pendingPoiCoords || editingPoi) && (
        <PoiModal
          poi={editingPoi || undefined}
          onSave={handlePoiSave}
          onDelete={editingPoi ? () => handlePoiDelete(editingPoi.id) : undefined}
          onClose={() => {
            setPendingPoiCoords(null);
            setEditingPoi(null);
          }}
        />
      )}
    </div>
  );
}
