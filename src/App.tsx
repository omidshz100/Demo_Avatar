import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AvatarApp } from "./pages/AvatarApp";
import { AdminDashboard } from "./pages/AdminDashboard";
import { SandboxChat } from "./pages/SandboxChat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AvatarApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/sandbox" element={<SandboxChat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
