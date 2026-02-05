"use client";

import { useRef } from "react";

interface ToolBarProps {
  activeTool: "draw" | "poi" | "eraser" | "pan";
  setActiveTool: (tool: "draw" | "poi" | "eraser" | "pan") => void;
  snapToRoad: boolean;
  setSnapToRoad: (v: boolean) => void;
  is3D: boolean;
  toggle3D: () => void;
  isSatellite: boolean;
  toggleSatellite: () => void;
  undoWaypoint: () => void;
  clearRoute: () => void;
  importGPX: (file: File) => void;
  isProcessing: boolean;
}

function ToolBtn({
  active,
  onClick,
  title,
  children,
  color,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:scale-110"
      style={{
        backgroundColor: active ? (color || "var(--teal-deep)") : "white",
        color: active ? "white" : "var(--dark)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        border: active ? "none" : "1px solid rgba(0,0,0,0.1)",
      }}
    >
      {children}
    </button>
  );
}

export function ToolBar({
  activeTool,
  setActiveTool,
  snapToRoad,
  setSnapToRoad,
  is3D,
  toggle3D,
  isSatellite,
  toggleSatellite,
  undoWaypoint,
  clearRoute,
  importGPX,
  isProcessing,
}: ToolBarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      {/* Drawing tools */}
      <div className="flex flex-col gap-1.5 rounded-2xl bg-white/95 p-2 backdrop-blur" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
        <ToolBtn active={activeTool === "draw"} onClick={() => setActiveTool("draw")} title="Draw route (click to add points)">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" />
          </svg>
        </ToolBtn>

        <ToolBtn active={activeTool === "poi"} onClick={() => setActiveTool("poi")} title="Add POI" color="#E8B86D">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
        </ToolBtn>

        <ToolBtn active={activeTool === "eraser"} onClick={() => setActiveTool("eraser")} title="Remove point" color="#E07A5F">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20 5H9l-7 7 7 7h11a2 2 0 002-2V7a2 2 0 00-2-2z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </ToolBtn>

        <ToolBtn active={activeTool === "pan"} onClick={() => setActiveTool("pan")} title="Pan map">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
          </svg>
        </ToolBtn>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5 rounded-2xl bg-white/95 p-2 backdrop-blur" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
        <ToolBtn onClick={undoWaypoint} title="Undo last point">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </ToolBtn>

        <ToolBtn onClick={clearRoute} title="Clear route" color="#E07A5F">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </ToolBtn>

        <ToolBtn onClick={() => fileRef.current?.click()} title="Import GPX">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </ToolBtn>
        <input
          ref={fileRef}
          type="file"
          accept=".gpx"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && importGPX(e.target.files[0])}
        />
      </div>

      {/* View controls */}
      <div className="flex flex-col gap-1.5 rounded-2xl bg-white/95 p-2 backdrop-blur" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
        <ToolBtn active={snapToRoad} onClick={() => setSnapToRoad(!snapToRoad)} title={snapToRoad ? "Snap to roads ON" : "Snap to roads OFF"} color="#68B59B">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
        </ToolBtn>

        <ToolBtn active={is3D} onClick={toggle3D} title="3D View">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          </svg>
        </ToolBtn>

        <ToolBtn active={isSatellite} onClick={toggleSatellite} title="Satellite view">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10" />
          </svg>
        </ToolBtn>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="rounded-xl bg-white/95 px-3 py-2 text-xs font-medium backdrop-blur" style={{ color: "var(--teal-deep)", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
          ⟳ Snapping...
        </div>
      )}
    </div>
  );
}
