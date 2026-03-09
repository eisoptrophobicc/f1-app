import { useState } from "react";
import ReplayScene from "./pixi/ReplayScene";

function App() {
  const [dsqMode, setDsqMode] = useState("show");
  const [dnfMode, setDnfMode] = useState("freeze"); 

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <ReplayScene dsqMode={dsqMode} dnfMode={dnfMode} />

      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "#111",
          padding: "12px",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div>
          <strong>DNF:</strong>
          <button onClick={() => setDnfMode("freeze")}>Freeze</button>
          <button onClick={() => setDnfMode("hide")}>Hide</button>
          <button onClick={() => setDnfMode("ghost")}>Ghost</button>
        </div>

        <div>
          <strong>DSQ:</strong>
          <button onClick={() => setDsqMode("show")}>Show</button>
          <button onClick={() => setDsqMode("hide")}>Hide</button>
          <button onClick={() => setDsqMode("ghost")}>Ghost</button>
        </div>
      </div>
    </div>
  );
}

export default App;