import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/routes/Landing";
import Replay from "@/routes/Replay";
import Throbber from "@/components/Throbber";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/replay" element={<Replay />} />
      </Routes>
    </BrowserRouter>
  );
}

/*function App() {
  return <Throbber text="Testing..." />;
}*/

export default App;