import { Routes, Route, NavLink } from "react-router-dom";
import Ticker from "./components/Ticker.jsx";
import MisPortafolios from "./pages/MisPortafolios.jsx";
import AgregarPortafolio from "./pages/AgregarPortafolio.jsx";
import DetallePortafolio from "./pages/DetallePortafolio.jsx";
import Cotizar from "./pages/Cotizar.jsx";
import Comprar from "./pages/Comprar.jsx";
import Vender from "./pages/Vender.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark">◆</span>
            <span>TESVG <em>Trading</em></span>
          </div>
          <nav className="topnav">
            <NavLink to="/" end>Mis Portafolios</NavLink>
            <NavLink to="/agregar-portafolio">Agregar Portafolio</NavLink>
            <NavLink to="/cotizar">Cotizar</NavLink>
            <NavLink to="/comprar">Comprar</NavLink>
            <NavLink to="/vender">Vender</NavLink>
          </nav>
        </div>
        <Ticker />
      </header>

      <main className="page-container">
        <Routes>
          <Route path="/" element={<MisPortafolios />} />
          <Route path="/agregar-portafolio" element={<AgregarPortafolio />} />
          <Route path="/portafolios/:id" element={<DetallePortafolio />} />
          <Route path="/cotizar" element={<Cotizar />} />
          <Route path="/comprar" element={<Comprar />} />
          <Route path="/vender" element={<Vender />} />
        </Routes>
      </main>
    </div>
  );
}
