import { useEffect, useState } from "react";
import landTempByCountry from "../assets/GlobalLandTemperaturesByCountry.csv?url";
import co2Emissions from "../assets/owid-co2-data.csv?url";

import { DATASET_STYLES } from "./Globe";

// Map of dataset country names and expected country names
// TODO add more discrepencies
const TEMP_COUNTRY_NAME_MAP = {
  // Country from dataset : Country known by globe
  "Åland": "Finland",
  "United States": "United States of America",
  "Republic of the Congo": "Congo",
  "Bosnia And Herzegovina": "Bosnia and Herz.",
  "Central African Republic": "Central African Rep.",
  "Dominican Republic": "Dominican Rep.",
  "Equatorial Guinea": "Eq. Guinea",
  "Solomon Islands": "Solomon Is.",
  "Western Sahara": "W. Sahara",
  "Guinea Bissau": "Guinea-Bissau",
  "Falkland Islands (Islas Malvinas)": "Falkland Is.",
  "Congo (Democratic Republic Of The)": "Dem. Rep. Congo",
  "Burma": "Myanmar",
  "Czech Republic": "Czechia",
  "Swaziland": "eSwatini",
  "Timor Leste": "Timor-Leste",
  "Dem. Rep. Korea": "North Korea",
  "Republic of Korea": "South Korea",
  "Palestina": "Palestine",
  "Côte D'Ivoire": "Côte d'Ivoire",
  "S. Sudan": "South Sudan",
};

const CO2_COUNTRY_NAME_MAP = {
  // Country from dataset : Country known by globe
  "Åland": "Finland",
  "United States": "United States of America",
  "Republic of the Congo": "Congo",
  "Bosnia And Herzegovina": "Bosnia and Herz.",
  "Central African Republic": "Central African Rep.",
  "Dominican Republic": "Dominican Rep.",
  "Equatorial Guinea": "Eq. Guinea",
  "Solomon Islands": "Solomon Is.",
  "Western Sahara": "W. Sahara",
  "Guinea Bissau": "Guinea-Bissau",
  "Falkland Islands (Islas Malvinas)": "Falkland Is.",
  "Congo (Democratic Republic Of The)": "Dem. Rep. Congo",
  "Burma": "Myanmar",
  "Czech Republic": "Czechia",
  "Swaziland": "eSwatini",
  "Timor Leste": "Timor-Leste",
  "Dem. Rep. Korea": "North Korea",
  "Republic of Korea": "South Korea",
  "Palestina": "Palestine",
  "Côte D'Ivoire": "Côte d'Ivoire",
  "Bosnia and Herzegovina": "Bosnia and Herz.",
  "Dominican Republic": "Dominican Rep.",
  "North Macedonia": "Macedonia",
  "S. Sudan": "South Sudan",
};

// Menu
export default function Menu({
  dateSelected,
  activeDatasetKey,
  datasetStyle,
  datasetOptions,
  onChangeDate,
  onChangeDatasetKey,
  onChangeDataByCountry,
}) {
  const [tempRows, setTempRows] = useState([]);
  const [co2Rows, setCo2Rows] = useState([]);

  // Load temperature by country dataset
  useEffect(() => {
    fetch(landTempByCountry)
      .then((r) => r.text())
      .then((text) => {
        const lines = text.split("\n");
        const headers = lines[0].split(",");

        const dtIdx = headers.indexOf("dt");
        const countryIdx = 3; // hard-coded, using indexOf adds a "\r" in front of "Country"
        const valueIdx = headers.indexOf("AverageTemperature");
        const valueUncertaintyIdx = headers.indexOf("AverageTemperatureUncertainty");

        const rows = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",");
          if (!cols[countryIdx]) continue;

          rows.push({
            dt: cols[dtIdx]?.slice(0, 10),
            country: cols[countryIdx].trim(),
            value: parseFloat(cols[valueIdx]),
            uncertainty: parseFloat(cols[valueUncertaintyIdx])
          });
        }

        setTempRows(rows);
      });
  }, []);

  // Load CO2 emission by country dataset
  useEffect(() => {
    fetch(co2Emissions)
      .then((r) => r.text())
      .then((text) => {
        const lines = text.split("\n");
        const headers = lines[0].split(",");

        const yearIdx = headers.indexOf("year");
        const countryIdx = headers.indexOf("country");
        const valueIdx = headers.indexOf("co2_per_capita");
        const populationIdx = headers.indexOf("population");

        const rows = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",");
          if (!cols[countryIdx] || !cols[yearIdx]) continue;

          rows.push({
            dt: `${cols[yearIdx]}-01-01`,
            country: cols[countryIdx],
            value: parseFloat(cols[valueIdx]),
            population: cols[populationIdx]
          });
        }

        setCo2Rows(rows);
      });
  }, []);

  // Recompute dataByCountry WHEN dataset OR date CHANGES
  useEffect(() => {
    let rows = [];
    if (activeDatasetKey === "temperature") {
        console.log(`Using ${activeDatasetKey} dataset`)
        rows = tempRows;
    }
    else if (activeDatasetKey === "co2") {
        console.log(`Using ${activeDatasetKey} dataset`)
        rows = co2Rows;
    }

    const map = {};
    for (const r of rows) {
      if (r.dt === dateSelected && !Number.isNaN(r.value)) {

        // Matches same countries if an alternative name exist
        let globeName = ""
        if (activeDatasetKey === "temperature") {
            globeName = TEMP_COUNTRY_NAME_MAP[r.country] || r.country;
        }
        else if (activeDatasetKey === "co2") {
            globeName = CO2_COUNTRY_NAME_MAP[r.country] || r.country;
        }        
        map[globeName] = r.value;
      }
    }

    onChangeDataByCountry(map);
  }, [dateSelected, activeDatasetKey, tempRows, co2Rows]);

  const legendStops = datasetStyle.legendStops;
  const colorFn = datasetStyle.colorFn;

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 10,
        top: 12,
        left: 12,
        background: "rgba(2,6,23,0.8)",
        borderRadius: 12,
        padding: 12,
        border: "1px solid #1f2937",
        width: 280,
        color: "#e5e7eb",
      }}
    >
      <h1 style={{ fontSize: 16, margin: 0 }}>Menu</h1>

      {/* Dataset */}
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 12, opacity: 0.8 }}>Dataset</label>
        <select
          value={activeDatasetKey}
          onChange={(e) => onChangeDatasetKey(e.target.value)}
          style={{
            width: "100%",
            marginTop: 4,
            padding: "6px 8px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "transparent",
            color: "white",
          }}
        >
          {datasetOptions.map((d) => (
            <option key={d.key} value={d.key} style={{ color: "black" }}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 12, opacity: 0.8 }}>Date</label>
        <input
          type="date"
          value={dateSelected}
          onChange={(e) => onChangeDate(e.target.value)}
          style={{
            width: "100%",
            marginTop: 4,
            padding: "6px 8px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "transparent",
            color: "white",
          }}
        />
      </div>

      {/* Legend */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, marginBottom: 6, opacity: 0.8 }}>
          {datasetStyle.label} ({datasetStyle.unit})
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {legendStops.map((stop) => (
            <div key={stop.label} style={{ textAlign: "center", flex: 1 }}>
              <div
                style={{
                  height: 12,
                  borderRadius: 4,
                  background: colorFn(stop.value),
                }}
              />
              <div style={{ fontSize: 10, opacity: 0.85 }}>{stop.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
