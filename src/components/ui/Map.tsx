"use client";

import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
      <div className="animate-pulse text-slate-400">Loading Map...</div>
    </div>
  ),
});

interface MapProps {
  center: [number, number];
  zoom?: number;
  label?: string;
}

export function Map(props: MapProps) {
  return <MapInner {...props} />;
}
