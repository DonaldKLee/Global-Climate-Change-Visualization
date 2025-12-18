import React, { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { feature } from "topojson-client";

// Temperature color scale
const TEMP_MIN = -20;
const TEMP_MAX = 40;

function tempColor(value) {
  if (value == null || Number.isNaN(value)) return "#555";

  const t = Math.max(TEMP_MIN, Math.min(TEMP_MAX, value));
  const x = (t - TEMP_MIN) / (TEMP_MAX - TEMP_MIN);

  if (x < 0.15) return "#0b3c5d";
  if (x < 0.30) return "#3288bd";
  if (x < 0.45) return "#66c2a5";
  if (x < 0.60) return "#abdda4";
  if (x < 0.75) return "#fee08b";
  if (x < 0.90) return "#f46d43";
  return "#d73027";
}

// CO2 color scale
const CO2_MIN = 0;
const CO2_MAX = 40;

function co2Color(value) {
  if (value == null || Number.isNaN(value)) return "#555";

  const t = Math.max(CO2_MIN, Math.min(CO2_MAX, value));
  const x = (t - CO2_MIN) / (CO2_MAX - CO2_MIN);

  if (x < 0.2) return "#dcd4f9ff";
  if (x < 0.4) return "#b8a7f8ff";
  if (x < 0.6) return "#a855f7";
  if (x < 0.8) return "#db2777";
  return "#b91c1c";
}

// Country details
export const DATASET_STYLES = {
  temperature: {
    key: "temperature",
    label: "Land Temperature",
    unit: "°C",
    colorFn: tempColor,
    legendStops: [
      { label: "≤ -20°C", value: -20 },
      { label: "-10°C", value: -10 },
      { label: "0°C", value: 0 },
      { label: "10°C", value: 10 },
      { label: "20°C", value: 20 },
      { label: "30°C", value: 30 },
      { label: "≥ 40°C", value: 40 },
    ],
  },

  co2: {
    key: "co2",
    label: "CO₂ Emissions per Capita",
    unit: "t/person",
    colorFn: co2Color,
    legendStops: [
      { label: "0", value: 0 },
      { label: "1", value: 1 },
      { label: "5", value: 5 },
      { label: "10", value: 10 },
      { label: "20", value: 20 },
      { label: "≥ 40", value: 40 },
    ],
  },
};

// Menu dropdown options
export const DATASET_OPTIONS = [
  { key: "temperature", label: "Land Temperature" },
  { key: "co2", label: "CO₂ Emissions" },
];

// Globe
export default function Globe3D({
  dataByCountry = {},
  datasetKey = "temperature",
}) {

  const globeRef = useRef();
  const [countries, setCountries] = useState([]);
  const [hoverD, setHoverD] = useState(null);

  const style = DATASET_STYLES[datasetKey];
  const { label, unit, colorFn } = style;

  // Load polygon shapes
  useEffect(() => {
    let mounted = true;
    (async () => {
      const topo = await import("world-atlas/countries-110m.json");
      const world = topo.default || topo;
      const feats = feature(world, world.objects.countries).features;
      if (mounted) setCountries(feats);
    })();
    return () => (mounted = false);
  }, []);

  // Autospin
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    g.controls().autoRotate = true;
    g.controls().autoRotateSpeed = 0.35;
  }, [countries.length]);

  const getName = (d) =>
    d?.properties?.name || d?.properties?.NAME || d?.id;

  const polygonAltitude = (d) =>
    hoverD && getName(hoverD) === getName(d) ? 0.025 : 0.006;

  const polygonCapColor = (d) => {
    const name = getName(d);
    const entry = dataByCountry[name];

    const value = typeof entry === "number" ? entry : entry?.value;

    return hoverD && getName(hoverD) === name ? "#fff" : colorFn(value);
  };

  // This is the modal that appears beside a country on hover
  const polygonLabel = (d) => {
    const name = getName(d);
    const entry = dataByCountry[name];

    const value = typeof entry === "number" ? entry : entry?.value;

    if (datasetKey === "temperature") {
      const uncertainty =
        typeof entry === "object" && entry != null ? entry.uncertainty : null;

      return `
        <div style="padding:6px 8px;font-size:12px;">
          <b>${name}</b><br/>
          ${label}: ${value == null || Number.isNaN(value) ? "—" : value.toFixed(2)} ${unit}<br/>
          Uncertainty: ${
            uncertainty == null || Number.isNaN(uncertainty) ? "—" : uncertainty.toFixed(2)
          } ${unit}
        </div>
      `;
    }

    // co2
    else if (datasetKey === "co2") {
      const population =
        typeof entry === "object" && entry != null ? entry.population : null;
      const gdp =
        typeof entry === "object" && entry != null ? entry.gdp : null;
      const energy =
        typeof entry === "object" && entry != null ? entry.energy : null;
      const co2 =
        typeof entry === "object" && entry != null ? entry.co2 : null;

      return `
        <div style="padding:6px 8px;font-size:12px;">
          <b>${name}</b><br/>
          ${label}: ${value == null || Number.isNaN(value) ? "—" : value.toFixed(2)} ${unit}<br/>
          Population: ${population == null || Number.isNaN(population) ? "—" : population.toFixed(0)} people<br/>
          GDP: ${gdp == null || Number.isNaN(gdp) ? "—" : gdp.toFixed(0)}<br/>
          Energy: ${energy == null || Number.isNaN(energy) ? "—" : energy.toFixed(2)} TWh<br/>
          CO₂ (total): ${co2 == null || Number.isNaN(co2) ? "—" : co2.toFixed(2)} MtCO₂
        </div>
      `;
    }
  };

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
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
