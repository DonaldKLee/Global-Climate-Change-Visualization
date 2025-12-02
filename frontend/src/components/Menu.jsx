import { useEffect, useState } from "react";
import landTempByCountry from "../assets/GlobalLandTemperaturesByCountry.csv?url";
import co2Emissions from "../assets/owid-co2-data.csv?url";

import { TEMP_MIN, TEMP_MAX, tempColor } from "./Globe"; // import from Globe

// Map of mismatched countries
const COUNTRY_NAME_MAP = {
  "Åland": "Finland",
  "United States": "United States of America",
};

function normalizeCountryName(csvName) {
  return COUNTRY_NAME_MAP[csvName] || csvName;
}

export default function Menu({
  dateSelected,
  onChangeDate,
  onChangeDataByCountry, // (map) => void
}) {
  const [rows, setRows] = useState([]);

  // Load CSV once
  useEffect(() => {
    fetch(landTempByCountry)
      .then((r) => r.text())
      .then((text) => {
        const lines = text.trim().split("\n");
        if (lines.length <= 1) return;

        const headerLine = lines[0];
        const headers = headerLine
          .replace("\r", "")
          .replace("\ufeff", "")
          .split(",");

        const dtIdx = headers.indexOf("dt");
        const countryIdx = headers.indexOf("Country");
        const valueIdx = headers.indexOf("AverageTemperature");

        if (dtIdx === -1 || countryIdx === -1 || valueIdx === -1) {
          console.error("Missing dt / Country / AverageTemperature columns");
          return;
        }

        const maxIdx = Math.max(dtIdx, countryIdx, valueIdx);
        const parsed = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = line.replace("\r", "").split(",");
          if (cols.length <= maxIdx) continue;

          const dtRaw = cols[dtIdx];
          const countryRaw = cols[countryIdx];
          const valueRaw = cols[valueIdx];

          if (!countryRaw) continue;

          const country = countryRaw.trim();
          const dt = dtRaw ? dtRaw.slice(0, 10) : "";
          const value = valueRaw ? parseFloat(valueRaw) : NaN;

          parsed.push({ dt, country, value });
        }

        console.log("Parsed sample:", parsed.slice(0, 10));
        setRows(parsed);
      })
      .catch((err) => {
        console.error("Error loading CSV:", err);
      });
  }, []);

  // Recompute { countryName: value } when rows or date changes
  useEffect(() => {
    if (!rows.length) return;

    const map = {};
    for (const r of rows) {
      if (!r.country || !r.dt) continue;
      if (r.dt === dateSelected && !Number.isNaN(r.value)) {
        const globeName = normalizeCountryName(r.country);
        map[globeName] = r.value;
      }
    }
    console.log("Data map for", dateSelected, map);
    onChangeDataByCountry(map);
  }, [rows, dateSelected, onChangeDataByCountry]);

  const MIN_DATE = "1700-01-01";
  const MAX_DATE = "2013-01-01";

  function handleDateChange(e) {
    const newDate = e.target.value;
    onChangeDate(newDate);
  }

  const legendStops = [
    { label: `≤ ${TEMP_MIN}°C`, value: TEMP_MIN },
    { label: "-10°C", value: -10 },
    { label: "0°C", value: 0 },
    { label: "10°C", value: 10 },
    { label: "20°C", value: 20 },
    { label: "30°C", value: 30 },
    { label: `≥ ${TEMP_MAX}°C`, value: TEMP_MAX },
  ];

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 10,
        top: 12,
        left: 12,
        background: "rgba(2,6,23,0.8)",
        border: "1px solid #1f2937",
        borderRadius: 12,
        padding: "10px 12px",
        color: "#e5e7eb",
        maxWidth: 260,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 16 }}>Menu</h1>

      <div style={{ marginTop: 10 }}>
        <label
          style={{
            fontSize: 12,
            opacity: 0.8,
            display: "block",
            marginBottom: 4,
          }}
        >
          Date (dt)
        </label>
        <input
          type="date"
          value={dateSelected}
          min={MIN_DATE}
          max={MAX_DATE}
          onChange={handleDateChange}
          style={{
            background: "transparent",
            color: "#e5e7eb",
            border: "1px solid #334155",
            borderRadius: 8,
            padding: "6px 8px",
            width: "100%",
          }}
        />
      </div>

      {/* Legend */}
      <div style={{ marginTop: 12 }}>
        <div
          style={{
            fontSize: 12,
            opacity: 0.8,
            marginBottom: 4,
          }}
        >
          Temperature scale (°C)
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 4,
            alignItems: "flex-end",
          }}
        >
          {legendStops.map((stop) => (
            <div
              key={stop.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 10,
                  borderRadius: 4,
                  background: tempColor(stop.value),
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  textAlign: "center",
                  opacity: 0.85,
                  whiteSpace: "nowrap",
                }}
              >
                {stop.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
