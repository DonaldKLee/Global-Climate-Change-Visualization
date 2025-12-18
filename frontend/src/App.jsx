import { useState, useMemo } from "react";
import "./App.css";

import Globe3D, { DATASET_STYLES, DATASET_OPTIONS } from "./components/Globe";
import Menu from "./components/Menu";
import Info from "./components/Info";

function App() {
  const [dateSelected, setDateSelected] = useState("1900-01-01");
  const [dataByCountry, setDataByCountry] = useState({});
  const [activeDatasetKey, setActiveDatasetKey] = useState("temperature");

  const datasetStyle = useMemo(
    () => DATASET_STYLES[activeDatasetKey] ?? DATASET_STYLES.temperature,
    [activeDatasetKey]
  );

  return (
    <>
      <Globe3D
        dataByCountry={dataByCountry} // row values from menu
        datasetKey={activeDatasetKey} // selected dataset
      />

      <Menu
        dateSelected={dateSelected}
        activeDatasetKey={activeDatasetKey}
        datasetStyle={datasetStyle}
        datasetOptions={DATASET_OPTIONS}
        onChangeDate={setDateSelected}
        onChangeDatasetKey={setActiveDatasetKey}
        onChangeDataByCountry={setDataByCountry}
      />

      <Info />
    </>
  );
}

export default App;
