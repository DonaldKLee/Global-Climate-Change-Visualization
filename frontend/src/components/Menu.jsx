import { useEffect, useMemo, useRef, useState } from "react";
import landTempByCountry from "../assets/GlobalLandTemperaturesByCountry.csv?url";
import co2Emissions from "../assets/owid-co2-data.csv?url";
import seaLevelRise from "../assets/Global_sea_level_rise.csv?url";
import globalTemps from "../assets/GlobalTemperatures.csv?url";

import { DATASET_STYLES } from "./Globe";

// Map of dataset country names and expected country names
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
  const [seaRows, setSeaRows] = useState([]);

  // Global avg temperature
  const [globalTempRows, setGlobalTempRows] = useState([]);

  // for animation
  const [draftYear, setDraftYear] = useState(() => {
    const y = parseInt(String(dateSelected).slice(0, 4), 10);
    return Number.isFinite(y) ? y : 1900;
  });

  // for animation
  const [draftMonthIndex, setDraftMonthIndex] = useState(() => {
    const y = parseInt(String(dateSelected).slice(0, 4), 10);
    const m = parseInt(String(dateSelected).slice(5, 7), 10);
    if (!Number.isFinite(y) || !Number.isFinite(m)) return 1900 * 12 + (1 - 1);
    return y * 12 + (m - 1);
  });

  // Animation
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);
  const lastDateRef = useRef({ key: `${activeDatasetKey}|${dateSelected}` });

  // ignore continents to prevent countries from being overwritten
  const CO2_IGNORE = useMemo(
    () =>
      new Set([
        "World",
        "Africa",
        "Asia",
        "Asia (excl. China and India)",
        "Europe",
        "Europe (excl. EU-27)",
        "Europe (excl. EU-28)",
        "European Union (27)",
        "European Union (28)",
        "High-income countries",
        "Lower-middle-income countries",
        "Upper-middle-income countries",
        "North America",
        "North America (excl. USA)",
        "Oceania",
        "South America",
      ]),
    []
  );

  const toYear = (iso) => {
    const y = parseInt(String(iso).slice(0, 4), 10);
    return Number.isFinite(y) ? y : null;
  };

  const toMonthIndex = (iso) => {
    const y = parseInt(String(iso).slice(0, 4), 10);
    const m = parseInt(String(iso).slice(5, 7), 10);
    if (!Number.isFinite(y) || !Number.isFinite(m)) return null;
    return y * 12 + (m - 1);
  };

  const monthIndexToIso = (mi) => {
    const y = Math.floor(mi / 12);
    const m = (mi % 12) + 1;
    const mm = String(m).padStart(2, "0");
    return `${y}-${mm}-01`;
  };

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const tempAvailableDatesSorted = useMemo(() => {
    if (!tempRows.length) return [];
    const set = new Set();
    for (const r of tempRows) {
      if (r.dt) set.add(r.dt);
    }
    return Array.from(set).sort();
  }, [tempRows]);

  const tempAvailableMonthKeysSorted = useMemo(() => {
    if (!tempAvailableDatesSorted.length) return [];
    const set = new Set();
    for (const dt of tempAvailableDatesSorted) {
      const mi = toMonthIndex(dt);
      if (mi != null) set.add(mi);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [tempAvailableDatesSorted]);

  const tempMinMonthIndex = useMemo(() => {
    if (!tempAvailableMonthKeysSorted.length) return 1800 * 12 + 0;
    return tempAvailableMonthKeysSorted[0];
  }, [tempAvailableMonthKeysSorted]);

  const tempMaxMonthIndex = useMemo(() => {
    if (!tempAvailableMonthKeysSorted.length) {
      const now = new Date();
      return now.getFullYear() * 12 + now.getMonth();
    }
    return tempAvailableMonthKeysSorted[tempAvailableMonthKeysSorted.length - 1];
  }, [tempAvailableMonthKeysSorted]);

  const co2YearsSorted = useMemo(() => {
    if (!co2Rows.length) return [];
    const set = new Set();
    for (const r of co2Rows) {
      const y = toYear(r.dt);
      if (y != null) set.add(y);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [co2Rows]);

  const co2MinYear = useMemo(
    () => (co2YearsSorted.length ? co2YearsSorted[0] : 1800),
    [co2YearsSorted]
  );
  const co2MaxYear = useMemo(
    () =>
      co2YearsSorted.length
        ? co2YearsSorted[co2YearsSorted.length - 1]
        : new Date().getFullYear(),
    [co2YearsSorted]
  );

  const pickClosestTempDateByMonthIndex = (targetMi) => {
    if (!tempAvailableDatesSorted.length) return monthIndexToIso(targetMi);

    // "round up": pick first available date >= YYYY-MM-01 of target month
    const targetIso = monthIndexToIso(targetMi);
    const targetKey = parseInt(targetIso.replaceAll("-", ""), 10);

    let lo = 0;
    let hi = tempAvailableDatesSorted.length - 1;
    let ans = null;

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const dt = tempAvailableDatesSorted[mid];
      const key = parseInt(dt.replaceAll("-", ""), 10);

      if (key >= targetKey) {
        ans = dt;
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    }

    return ans || tempAvailableDatesSorted[tempAvailableDatesSorted.length - 1];
  };

  const normalizeDateForDataset = (rawIso, datasetKey) => {
    const y = toYear(rawIso);
    const mi = toMonthIndex(rawIso);

    if (datasetKey === "co2") {
      const yy = clamp(y ?? 1900, co2MinYear, co2MaxYear);
      return `${yy}-01-01`;
    }

    // temperature: month-based snapping
    const baseMi = mi ?? 1900 * 12 + 0;
    const clampedMi = clamp(baseMi, tempMinMonthIndex, tempMaxMonthIndex);

    // if the exact date exists, keep it
    if (
      tempAvailableDatesSorted.length &&
      tempAvailableDatesSorted.includes(rawIso)
    )
      return rawIso;

    return pickClosestTempDateByMonthIndex(clampedMi);
  };

  const commitDateOnce = (nextDate) => {
    const normalized = normalizeDateForDataset(nextDate, activeDatasetKey);
    const commitKey = `${activeDatasetKey}|${normalized}`;

    if (lastDateRef.current.key === commitKey) return;
    lastDateRef.current.key = commitKey;

    if (normalized !== dateSelected) onChangeDate(normalized);
  };

  const clearPlayTimer = () => {
    if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }
  };

  const stopPlay = () => {
    setIsPlaying(false);
    clearPlayTimer();
  };

  // Generic stepper runner (works for both years and monthIndex)
  const startStepper = ({ getStart, setDraft, min, max, stepMs, stepToIso }) => {
    setIsPlaying(true);

    // start from current selection (or fallback to min)
    let cur = clamp(getStart() ?? min, min, max);

    playTimerRef.current = setInterval(() => {
      const next = cur + 1;

      // stop at end of dataset range
      if (next > max) {
        stopPlay();
        return;
      }

      cur = next;

      // keep scrubber UI in sync
      setDraft(cur);

      // commit to globe
      commitDateOnce(stepToIso(cur));
    }, stepMs);
  };

  useEffect(() => {
    return () => stopPlay();
  }, []);

  useEffect(() => {
    stopPlay();
  }, [activeDatasetKey]);

  useEffect(() => {
    const y = toYear(dateSelected);
    const mi = toMonthIndex(dateSelected);
    if (y != null) setDraftYear(y);
    if (mi != null) setDraftMonthIndex(mi);
  }, [dateSelected, activeDatasetKey]);

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
        const valueUncertaintyIdx = headers.indexOf(
          "AverageTemperatureUncertainty"
        );

        const rows = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",");
          if (!cols[countryIdx]) continue;

          rows.push({
            dt: cols[dtIdx]?.slice(0, 10),
            country: cols[countryIdx].trim(),
            value: parseFloat(cols[valueIdx]),
            uncertainty: parseFloat(cols[valueUncertaintyIdx]),
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
        const co2PerCapitaIdx = headers.indexOf("co2_per_capita");

        // Kaya-needed fields
        const populationIdx = headers.indexOf("population");
        const gdpIdx = headers.indexOf("gdp");
        const energyIdx = headers.indexOf("primary_energy_consumption");
        const co2TotalIdx = headers.indexOf("co2");

        const rows = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",");
          if (!cols[countryIdx] || !cols[yearIdx]) continue;

          const country = cols[countryIdx];
          if (CO2_IGNORE.has(country)) continue;

          rows.push({
            dt: `${cols[yearIdx]}-01-01`,
            country: cols[countryIdx],
            co2: parseFloat(cols[co2TotalIdx]),
            population: parseFloat(cols[populationIdx]),
            gdp: parseFloat(cols[gdpIdx]),
            energy: parseFloat(cols[energyIdx]),
            value: parseFloat(cols[co2PerCapitaIdx]),
          });
        }

        console.log(rows);
        setCo2Rows(rows);
      });
  }, [CO2_IGNORE]);

  // Load global sea level rise dataset
  useEffect(() => {
    fetch(seaLevelRise)
      .then((r) => r.text())
      .then((text) => {
        const lines = text.split("\n");
        const headers = lines[0].trim().split(",");

        const yearIdx = headers.indexOf("year");
        const dateIdx = headers.indexOf("date");
        const mmIdx = headers.indexOf("mmfrom1993-2008average");

        const rows = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = line.split(",");
          const yearStr = cols[yearIdx];
          if (!yearStr) continue;

          const yr = parseInt(yearStr, 10);
          const mm = parseFloat(cols[mmIdx]);

          if (!Number.isFinite(yr) || Number.isNaN(mm)) continue;

          rows.push({
            year: yr,
            dt: cols[dateIdx],
            mm,
          });
        }

        rows.sort((a, b) => a.year - b.year);
        setSeaRows(rows);
      });
  }, []);

  // Load global average temperature dataset
  useEffect(() => {
    fetch(globalTemps)
      .then((r) => r.text())
      .then((text) => {
        const lines = text.split("\n");
        const headers = lines[0].trim().split(",");

        const dtIdx = headers.indexOf("dt");
        const landIdx = headers.indexOf("LandAverageTemperature");
        const landOceanIdx = headers.indexOf("LandAndOceanAverageTemperature");

        const rows = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = line.split(",");
          const dt = cols[dtIdx]?.slice(0, 10);
          if (!dt) continue;

          const land = parseFloat(cols[landIdx]);
          const landOcean = parseFloat(cols[landOceanIdx]);

          // prefer land+ocean if present, else fallback to only land
          const value =
            !Number.isNaN(landOcean)
              ? landOcean
              : !Number.isNaN(land)
              ? land
              : NaN;

          if (Number.isNaN(value)) continue;

          rows.push({ dt, value });
        }

        rows.sort((a, b) => a.dt.localeCompare(b.dt));
        setGlobalTempRows(rows);
      });
  }, []);

  // Recompute dataByCountry WHEN dataset OR date CHANGES
  useEffect(() => {
    let rows = [];
    if (activeDatasetKey === "temperature") {
      console.log(`Using ${activeDatasetKey} dataset`);
      rows = tempRows;
    } else if (activeDatasetKey === "co2") {
      console.log(`Using ${activeDatasetKey} dataset`);
      rows = co2Rows;
    }

    const map = {};
    for (const r of rows) {
      if (r.dt === dateSelected && !Number.isNaN(r.value)) {
        // Matches same countries if an alternative name exist
        let globeName = "";
        if (activeDatasetKey === "temperature") {
          globeName = TEMP_COUNTRY_NAME_MAP[r.country] || r.country;

          map[globeName] = {
            value: r.value,
            uncertainty: r.uncertainty,
          };
        } else if (activeDatasetKey === "co2") {
          globeName = CO2_COUNTRY_NAME_MAP[r.country] || r.country;

          map[globeName] = {
            value: r.value,
            co2: r.co2,
            population: r.population,
            gdp: r.gdp,
            energy: r.energy,
          };
        }
      }
    }

    onChangeDataByCountry(map);
  }, [dateSelected, activeDatasetKey, tempRows, co2Rows, onChangeDataByCountry]);

  const legendStops = datasetStyle.legendStops;
  const colorFn = datasetStyle.colorFn;

  const isTemp = activeDatasetKey === "temperature";

  const scrubMin = isTemp ? tempMinMonthIndex : co2MinYear;
  const scrubMax = isTemp ? tempMaxMonthIndex : co2MaxYear;

  const resolvedPreviewDate = useMemo(() => {
    if (!isTemp) {
      const y = clamp(draftYear, co2MinYear, co2MaxYear);
      return `${y}-01-01`;
    }

    const mi = clamp(draftMonthIndex, tempMinMonthIndex, tempMaxMonthIndex);
    return pickClosestTempDateByMonthIndex(mi);
  }, [
    isTemp,
    draftYear,
    draftMonthIndex,
    co2MinYear,
    co2MaxYear,
    tempMinMonthIndex,
    tempMaxMonthIndex,
    tempAvailableDatesSorted,
  ]);

  const handleDateInputChange = (rawIso) => {
    commitDateOnce(rawIso);
  };

  const handleScrubberCommit = () => {
    commitDateOnce(resolvedPreviewDate);
  };

  // Animation
  const togglePlay = () => {
    if (isPlaying) return stopPlay();

    // CO2 = yearly stepping
    if (!isTemp) {
      return startStepper({
        getStart: () => toYear(dateSelected),
        setDraft: setDraftYear,
        min: co2MinYear,
        max: co2MaxYear,
        stepMs: 200,
        stepToIso: (y) => `${y}-01-01`,
      });
    }

    // Temperature = monthly stepping (monthIndex)
    return startStepper({
      getStart: () => toMonthIndex(dateSelected),
      setDraft: setDraftMonthIndex,
      min: tempMinMonthIndex,
      max: tempMaxMonthIndex,
      stepMs: 120,
      stepToIso: (mi) => pickClosestTempDateByMonthIndex(mi),
    });
  };

  // Sea level
  const seaYearToMm = useMemo(() => {
    const map = new Map();
    for (const r of seaRows) map.set(r.year, r.mm);
    return map;
  }, [seaRows]);

  const seaYears = useMemo(() => seaRows.map((r) => r.year), [seaRows]);
  const seaMinYear = seaYears.length ? seaYears[0] : null;
  const seaMaxYear = seaYears.length ? seaYears[seaYears.length - 1] : null;

  const seaMmForSelected = useMemo(() => {
    if (!seaRows.length) return null;

    const y = toYear(dateSelected);
    if (y == null) return null;

    // closest year (round to nearest year in the sea level dataset)
    const yy = clamp(y, seaMinYear ?? y, seaMaxYear ?? y);

    // fast path
    if (seaYearToMm.has(yy)) return { year: yy, mm: seaYearToMm.get(yy) };

    // fallback: nearest available
    let bestYear = seaRows[0].year;
    let bestDist = Math.abs(seaRows[0].year - yy);
    for (const r of seaRows) {
      const d = Math.abs(r.year - yy);
      if (d < bestDist) {
        bestDist = d;
        bestYear = r.year;
      }
    }
    return { year: bestYear, mm: seaYearToMm.get(bestYear) };
  }, [seaRows, seaYearToMm, dateSelected, seaMinYear, seaMaxYear]);

  const seaSpark = useMemo(() => {
    if (!seaRows.length) return null;

    // simple mini sparkline: sample up to 60 points to keep svg small
    const maxPts = 60;
    const step = Math.max(1, Math.floor(seaRows.length / maxPts));
    const sampled = [];
    for (let i = 0; i < seaRows.length; i += step) sampled.push(seaRows[i]);
    if (sampled[sampled.length - 1]?.year !== seaRows[seaRows.length - 1]?.year) {
      sampled.push(seaRows[seaRows.length - 1]);
    }

    let min = Infinity;
    let max = -Infinity;
    for (const r of sampled) {
      if (r.mm < min) min = r.mm;
      if (r.mm > max) max = r.mm;
    }
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
      min = min === Infinity ? 0 : min - 1;
      max = max === -Infinity ? 1 : max + 1;
    }

    const W = 260;
    const H = 44;
    const pad = 2;

    const xFor = (i) => {
      const n = sampled.length - 1;
      if (n <= 0) return pad;
      return pad + (i / n) * (W - pad * 2);
    };

    const yFor = (mm) => {
      const t = (mm - min) / (max - min);
      return pad + (1 - t) * (H - pad * 2);
    };

    let d = "";
    sampled.forEach((r, i) => {
      const x = xFor(i);
      const y = yFor(r.mm);
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

    const selectedYear = seaMmForSelected?.year ?? null;
    let selX = null;
    let selY = null;
    if (selectedYear != null) {
      // find nearest sampled index
      let bestI = 0;
      let bestDist = Infinity;
      sampled.forEach((r, i) => {
        const dist = Math.abs(r.year - selectedYear);
        if (dist < bestDist) {
          bestDist = dist;
          bestI = i;
        }
      });
      selX = xFor(bestI);
      selY = yFor(sampled[bestI].mm);
    }

    return { d, W, H, selX, selY };
  }, [seaRows, seaMmForSelected]);

  // Global temperature
  const globalDatesSorted = useMemo(() => {
    if (!globalTempRows.length) return [];
    return globalTempRows.map((r) => r.dt);
  }, [globalTempRows]);

  const globalValueByDt = useMemo(() => {
    const m = new Map();
    for (const r of globalTempRows) m.set(r.dt, r.value);
    return m;
  }, [globalTempRows]);

  const pickClosestGlobalDateByMonthIndex = (targetMi) => {
    if (!globalDatesSorted.length) return monthIndexToIso(targetMi);

    const targetIso = monthIndexToIso(targetMi); // YYYY-MM-01
    const targetKey = parseInt(targetIso.replaceAll("-", ""), 10);

    let lo = 0;
    let hi = globalDatesSorted.length - 1;
    let ans = null;

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const dt = globalDatesSorted[mid];
      const key = parseInt(dt.replaceAll("-", ""), 10);

      if (key >= targetKey) {
        ans = dt;
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    }

    return ans || globalDatesSorted[globalDatesSorted.length - 1];
  };

  const globalTempForSelected = useMemo(() => {
    if (!globalTempRows.length) return null;

    const mi = toMonthIndex(dateSelected);
    if (mi == null) return null;

    const dt = globalValueByDt.has(dateSelected)
      ? dateSelected
      : pickClosestGlobalDateByMonthIndex(mi);

    const v = globalValueByDt.get(dt);
    if (v == null || Number.isNaN(v)) return null;

    return { dt, value: v };
  }, [globalTempRows, globalDatesSorted, globalValueByDt, dateSelected]);

  const globalTempSpark = useMemo(() => {
    if (!globalTempRows.length) return null;

    const maxPts = 70;
    const step = Math.max(1, Math.floor(globalTempRows.length / maxPts));
    const sampled = [];
    for (let i = 0; i < globalTempRows.length; i += step) sampled.push(globalTempRows[i]);
    if (sampled[sampled.length - 1]?.dt !== globalTempRows[globalTempRows.length - 1]?.dt) {
      sampled.push(globalTempRows[globalTempRows.length - 1]);
    }

    let min = Infinity;
    let max = -Infinity;
    for (const r of sampled) {
      if (r.value < min) min = r.value;
      if (r.value > max) max = r.value;
    }
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
      min = min === Infinity ? 0 : min - 1;
      max = max === -Infinity ? 1 : max + 1;
    }

    const W = 260;
    const H = 44;
    const pad = 2;

    const xFor = (i) => {
      const n = sampled.length - 1;
      if (n <= 0) return pad;
      return pad + (i / n) * (W - pad * 2);
    };

    const yFor = (val) => {
      const t = (val - min) / (max - min);
      return pad + (1 - t) * (H - pad * 2);
    };

    let d = "";
    sampled.forEach((r, i) => {
      const x = xFor(i);
      const y = yFor(r.value);
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

    const selectedDt = globalTempForSelected?.dt ?? null;
    let selX = null;
    let selY = null;
    if (selectedDt) {
      let bestI = 0;
      let bestDist = Infinity;
      sampled.forEach((r, i) => {
        const a = toMonthIndex(r.dt);
        const b = toMonthIndex(selectedDt);
        const dist = a != null && b != null ? Math.abs(a - b) : 999999;
        if (dist < bestDist) {
          bestDist = dist;
          bestI = i;
        }
      });
      selX = xFor(bestI);
      selY = yFor(sampled[bestI].value);
    }

    return { d, W, H, selX, selY };
  }, [globalTempRows, globalTempForSelected]);

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 10,
        top: 14,
        left: 14,
        width: 320,
        color: "#e5e7eb",
        borderRadius: 16,
        border: "1px solid rgba(148,163,184,0.18)",
        background: "rgba(2, 6, 23, 0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        padding: 14,
        overflowY: "scroll",
        height: "85%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ fontSize: 16, margin: 0, letterSpacing: 0.2 }}>Menu</h1>
        <div style={{ fontSize: 11, opacity: 0.75 }}>
          {DATASET_STYLES?.[activeDatasetKey]?.label ?? ""}
        </div>
      </div>

      {/* Dataset */}
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 12, opacity: 0.8 }}>Dataset</label>
        <select
          value={activeDatasetKey}
          onChange={(e) => {
            onChangeDatasetKey(e.target.value);

            const y = toYear(dateSelected);
            const mi = toMonthIndex(dateSelected);

            if (y != null) setDraftYear(y);
            if (mi != null) setDraftMonthIndex(mi);
          }}
          style={{
            width: "100%",
            marginTop: 6,
            padding: "10px 10px",
            borderRadius: 12,
            border: "1px solid rgba(148,163,184,0.25)",
            background: "rgba(15, 23, 42, 0.35)",
            color: "white",
            outline: "none",
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <label style={{ fontSize: 12, opacity: 0.8 }}>Date</label>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 650 }}>{dateSelected}</div>

            <button
              onClick={togglePlay}
              style={{
                padding: "8px 10px",
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.25)",
                background: isPlaying
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(15, 23, 42, 0.35)",
                color: "white",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 650,
                lineHeight: 1,
              }}
              title={isPlaying ? "Pause" : "Animate"}
            >
              {isPlaying ? "Pause" : "Animate"}
            </button>
          </div>
        </div>

        <input
          type="date"
          value={dateSelected}
          onChange={(e) => handleDateInputChange(e.target.value)}
          style={{
            width: "90%",
            marginTop: 6,
            padding: "10px 10px",
            borderRadius: 12,
            border: "1px solid rgba(148,163,184,0.25)",
            background: "rgba(15, 23, 42, 0.35)",
            color: "white",
            outline: "none",
          }}
        />

        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            opacity: 0.65,
            lineHeight: 1.25,
          }}
        >
          {activeDatasetKey === "co2"
            ? "CO₂ snaps to the closest available year."
            : "Temperature snaps to the closest available date rounded up."}
        </div>
      </div>

      {/* Time scrubber (year range) */}
      <div style={{ marginTop: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {isTemp ? "Time (month)" : "Time"}
          </div>
          <div style={{ fontSize: 12, fontWeight: 650 }}>{resolvedPreviewDate}</div>
        </div>

        <input
          type="range"
          min={scrubMin}
          max={scrubMax}
          value={
            isTemp
              ? clamp(draftMonthIndex, tempMinMonthIndex, tempMaxMonthIndex)
              : clamp(draftYear, co2MinYear, co2MaxYear)
          }
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (isTemp) setDraftMonthIndex(v);
            else setDraftYear(v);
          }}
          onMouseUp={handleScrubberCommit}
          onTouchEnd={handleScrubberCommit}
          style={{ width: "100%", marginTop: 10 }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            fontSize: 11,
            opacity: 0.7,
          }}
        >
          <span>{isTemp ? monthIndexToIso(scrubMin).slice(0, 7) : scrubMin}</span>
          <span>{isTemp ? monthIndexToIso(scrubMax).slice(0, 7) : scrubMax}</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, marginBottom: 8, opacity: 0.8 }}>
          {datasetStyle.label} ({datasetStyle.unit})
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {legendStops.map((stop) => (
            <div key={stop.label} style={{ textAlign: "center", flex: 1 }}>
              <div
                style={{
                  height: 12,
                  borderRadius: 999,
                  background: colorFn(stop.value),
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                }}
              />
              <div style={{ fontSize: 10, opacity: 0.85, marginTop: 4 }}>
                {stop.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global average temperature (global) */}
      <div
        style={{
          marginTop: 14,
          padding: 12,
          borderRadius: 14,
          border: "1px solid rgba(148,163,184,0.18)",
          background: "rgba(15, 23, 42, 0.30)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 650 }}>
            Global Avg Temperature
          </div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>
            {globalTempForSelected ? globalTempForSelected.dt : "—"}
          </div>
        </div>

        <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.2 }}>
            {globalTempForSelected
              ? `${globalTempForSelected.value.toFixed(2)} °C`
              : "—"}
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          {globalTempSpark ? (
            <svg
              width="100%"
              viewBox={`0 0 ${globalTempSpark.W} ${globalTempSpark.H}`}
              style={{ display: "block", opacity: 0.95 }}
            >
              <path
                d={globalTempSpark.d}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.9"
              />
              {globalTempSpark.selX != null && globalTempSpark.selY != null ? (
                <circle
                  cx={globalTempSpark.selX}
                  cy={globalTempSpark.selY}
                  r="4"
                  fill="#f78a68ff"
                />
              ) : null}
            </svg>
          ) : (
            <div style={{ height: 44, opacity: 0.6, fontSize: 12 }}>Loading…</div>
          )}
        </div>

        <div style={{ marginTop: 6, fontSize: 11, opacity: 0.65, lineHeight: 1.25 }}>
          Global metric (not per-country).
        </div>
      </div>

      {/* Sea level rise (global) */}
      <div
        style={{
          marginTop: 14,
          padding: 12,
          borderRadius: 14,
          border: "1px solid rgba(148,163,184,0.18)",
          background: "rgba(15, 23, 42, 0.30)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 650 }}>
            Sea Level Rise
          </div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>
            {seaMmForSelected ? seaMmForSelected.year : "—"}
          </div>
        </div>

        <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.2 }}>
            {seaMmForSelected ? `${seaMmForSelected.mm.toFixed(1)} mm` : "—"}
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          {seaSpark ? (
            <svg
              width="100%"
              viewBox={`0 0 ${seaSpark.W} ${seaSpark.H}`}
              style={{ display: "block", opacity: 0.95 }}
            >
              <path
                d={seaSpark.d}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.9"
              />
              {seaSpark.selX != null && seaSpark.selY != null ? (
                <circle cx={seaSpark.selX} cy={seaSpark.selY} r="4" fill="#70bdecff" />
              ) : null}
            </svg>
          ) : (
            <div style={{ height: 44, opacity: 0.6, fontSize: 12 }}>Loading…</div>
          )}
        </div>

        <div style={{ marginTop: 6, fontSize: 11, opacity: 0.65, lineHeight: 1.25 }}>
          Global metric (not per-country).
        </div>
      </div>
    </div>
  );
}
