"use client";

import { useParams } from "next/navigation";
import RouteBuilder from "@/components/route-builder/RouteBuilder";

export default function EditRoutePage() {
  const params = useParams();
  const routeId = params.id as string;

  return (
    <div className="h-[calc(100vh-4rem)]">
      <RouteBuilder routeId={routeId} />
    </div>
  );
}
