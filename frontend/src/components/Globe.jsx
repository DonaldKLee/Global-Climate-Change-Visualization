import React, { useEffect, useRef, useState, useMemo } from "react";
import Globe from "react-globe.gl";
import { feature } from "topojson-client";

export default function GlobeWithCountries({dataset, date}) {
  const globeRef = useRef();
  const [countries, setCountries] = useState([]);
  const [hoverD, setHoverD] = useState(null);

  // Function to open dataset file from dataset var, pass in date, return all the values
  


  // Load country polygons (TopoJSON -> GeoJSON)
  useEffect(() => {
    let mounted = true;
    (async () => {
      // dynamic import avoids Vite JSON module config headaches
      const topo = await import("world-atlas/countries-110m.json");
      const world = topo.default || topo;
      const feats = feature(world, world.objects.countries).features;
      if (mounted) setCountries(feats);
    })();
    return () => { mounted = false; };
  }, []);

  // Smooth auto-rotate
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    g.controls().autoRotate = true;
    g.controls().autoRotateSpeed = 0.35;
  }, []);

  const getName = (d) => d?.properties?.name || d?.properties?.NAME || d?.id;

  // Optional: subtle lift + color on hover
  const polygonAltitude = (d) =>
    hoverD && getName(hoverD) === getName(d) ? 0.02 : 0.006;

  const polygonCapColor = (d) =>
    hoverD && getName(hoverD) === getName(d) ? "#FFF" : "transparent"; // cyan vs sky

  const polygonLabel = (d) => `
    <div style="padding:6px 8px;font-size:12px;line-height:1.2">
      <div style="font-weight:600;margin-bottom:4px">${getName(d)}</div>
      <div style="opacity:.7">Hovering country polygon</div>
    </div>
  `;

  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <Globe
        ref={globeRef}
        backgroundColor="#0b1220"
        showAtmosphere
        atmosphereAltitude={0.15}
        animateIn
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"

        // --- Countries layer ---
        polygonsData={countries}
        polygonStrokeColor={() => "#FFF"}
        polygonSideColor={() => "#0f172a"}
        polygonCapColor={polygonCapColor}
        polygonAltitude={polygonAltitude}
        polygonLabel={polygonLabel}
        onPolygonHover={setHoverD}
      />
    </div>
  );
}
