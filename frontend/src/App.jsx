import { useState } from "react";
import "./App.css";

import Globe3D from "./components/Globe";
import Menu from "./components/Menu";

function App() {
  const [dateSelected, setDateSelected] = useState("1900-01-01");
  const [dataByCountry, setDataByCountry] = useState({});

  return (
    <>
      <Globe3D 
        dataByCountry={dataByCountry} 
        metricLabel={"Average Temperature (°C)"} 
      />

      <Menu
        dateSelected={dateSelected}
        onChangeDate={setDateSelected}
        onChangeDataByCountry={setDataByCountry}
      />
    </>
  );
}

export default App;
