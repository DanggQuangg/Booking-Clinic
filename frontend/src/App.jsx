import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* fallback để biết router có chạy */}
        <Route path="*" element={<div style={{ padding: 24 }}>NOT FOUND</div>} />
      </Routes>
    </BrowserRouter>
  );
}
