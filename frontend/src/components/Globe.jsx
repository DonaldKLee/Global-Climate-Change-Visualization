import React, { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { feature } from "topojson-client";

// Global constants so Globe + legend match
export const TEMP_MIN = -20;
export const TEMP_MAX = 40;

// Multi-stop temperature color scale (cool → warm)
export function tempColor(value) {
  if (value == null || Number.isNaN(value)) return "#555"; // if missing => gray

  const t = Math.max(TEMP_MIN, Math.min(TEMP_MAX, value));
  const x = (t - TEMP_MIN) / (TEMP_MAX - TEMP_MIN); // 0 → 1

  if (x < 0.15) return "#0b3c5d";   // very cold: dark blue
  if (x < 0.30) return "#3288bd";   // cold: blue
  if (x < 0.45) return "#66c2a5";   // cool: teal
  if (x < 0.60) return "#abdda4";   // mild: greenish
  if (x < 0.75) return "#fee08b";   // warm: yellow
  if (x < 0.90) return "#f46d43";   // hot: orange
  return "#d73027";                 // very hot: red
}

export default function Globe3D({
  dataByCountry = {},
  metricLabel = "Temperature (°C)"
}) {
  const globeRef = useRef();
  const [countries, setCountries] = useState([]);
  const [hoverD, setHoverD] = useState(null);

  // Load country polygon shapes
  useEffect(() => {
    let mounted = true;
    (async () => {
      const topo = await import("world-atlas/countries-110m.json");
      const world = topo.default || topo;
      const feats = feature(world, world.objects.countries).features;
      if (mounted) setCountries(feats);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Autospin globe
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    g.controls().autoRotate = true;
    g.controls().autoRotateSpeed = 0.35;
  }, [countries.length]);

  const getName = (d) =>
    d?.properties?.name || d?.properties?.NAME || d?.id;

  // Lift effect
  const polygonAltitude = (d) =>
    hoverD && getName(hoverD) === getName(d) ? 0.025 : 0.006;

  // Color based on temp
  const polygonCapColor = (d) => {
    const name = getName(d);
    const value = dataByCountry[name];
    if (hoverD && getName(hoverD) === name) return "#fff"; // highlight on hover
    return tempColor(value);
  };

  // Tooltip text
  const polygonLabel = (d) => {
    const name = getName(d);
    const val = dataByCountry[name];
    return `
      <div style="padding:6px 8px;font-size:12px;">
        <b>${name}</b><br/>
        ${metricLabel}: ${val == null ? "—" : val.toFixed(2)}°C
      </div>
    `;
  };

  return (
    <div style={{ height: "80vh", width: "100%", position: "relative" }}>
      <Globe
        ref={globeRef}
        backgroundColor="#0b1220"
        showAtmosphere
        atmosphereAltitude={0.15}
        animateIn
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        
        polygonsData={countries}
        polygonStrokeColor={() => "#ffffff"}
        polygonSideColor={() => "#0f172a"}
        
        polygonCapColor={polygonCapColor}
        polygonAltitude={polygonAltitude}
        polygonLabel={polygonLabel}
        onPolygonHover={setHoverD}
      />
    </div>
  );
}
