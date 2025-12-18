import { useEffect, useMemo, useState } from "react";
import "./App.css";

import Globe3D, { DATASET_STYLES, DATASET_OPTIONS } from "./components/Globe";
import Menu from "./components/Menu";
import Info from "./components/Info";

function useIsMobile(breakpointPx = 860) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${breakpointPx}px)`).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const onChange = (e) => setIsMobile(e.matches);

    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    setIsMobile(mq.matches);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, [breakpointPx]);

  return isMobile;
}

function App() {
  const [dateSelected, setDateSelected] = useState("1900-01-01");
  const [dataByCountry, setDataByCountry] = useState({});
  const [activeDatasetKey, setActiveDatasetKey] = useState("temperature");

  const datasetStyle = useMemo(
    () => DATASET_STYLES[activeDatasetKey] ?? DATASET_STYLES.temperature,
    [activeDatasetKey]
  );

  const isMobile = useIsMobile(860);

  // visibility toggles
  const [showMenu, setShowMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // desktop = always visible
  useEffect(() => {
    if (!isMobile) {
      setShowMenu(true);
      setShowInfo(true);
    } else {
      setShowMenu(false);
      setShowInfo(false);
    }
  }, [isMobile]);

  const btnBase = {
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.22)",
    background: "rgba(2, 6, 23, 0.78)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "#e5e7eb",
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow:
      "0 10px 26px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
    userSelect: "none",
  };

  const hiddenStyle = {
    visibility: "hidden",
    opacity: 0,
    pointerEvents: "none",
  };

  const visibleStyle = {
    visibility: "visible",
    opacity: 1,
    pointerEvents: "auto",
  };

  return (
    <>
      <Globe3D
        dataByCountry={dataByCountry}
        datasetKey={activeDatasetKey}
      />

      {/* Mobile toggle buttons */}
      {isMobile && (
        <div
          style={{
            position: "absolute",
            zIndex: 60,
            top: 14,
            left: 14,
            display: "flex",
            gap: 8,
          }}
        >
          <button
            type="button"
            style={{ ...btnBase, opacity: showMenu ? 1 : 0.72 }}
            onClick={() => setShowMenu((v) => !v)}
          >
            {showMenu ? "Close Menu" : "Menu"}
          </button>

          <button
            type="button"
            style={{ ...btnBase, opacity: showInfo ? 1 : 0.72 }}
            onClick={() => setShowInfo((v) => !v)}
          >
            {showInfo ? "Close Info" : "Info"}
          </button>
        </div>
      )}

      {/* Menu */}
      <div
        style={{
          transition: "opacity 160ms ease",
          ...(isMobile
            ? showMenu
              ? visibleStyle
              : hiddenStyle
            : visibleStyle),
        }}
      >
        <Menu
          dateSelected={dateSelected}
          activeDatasetKey={activeDatasetKey}
          datasetStyle={datasetStyle}
          datasetOptions={DATASET_OPTIONS}
          onChangeDate={setDateSelected}
          onChangeDatasetKey={setActiveDatasetKey}
          onChangeDataByCountry={setDataByCountry}
        />
      </div>

      {/* Info */}
      <div
        style={{
          transition: "opacity 160ms ease",
          ...(isMobile
            ? showInfo
              ? visibleStyle
              : hiddenStyle
            : visibleStyle),
        }}
      >
        <Info />
      </div>
    </>
  );
}

export default App;
