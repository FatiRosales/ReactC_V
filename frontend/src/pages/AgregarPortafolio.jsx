import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function AgregarPortafolio() {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const navigate = useNavigate();

  async function guardar(e) {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("Ingresa un nombre para el portafolio.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await api.crearPortafolio(nombre.trim());
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Nuevo</p>
        <h1>Agregar portafolio</h1>
        <p className="lead-muted">Crea un espacio para organizar las acciones que vas a comprar y vender.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-6">
          <div className="panel">
            <form onSubmit={guardar}>
              <div className="mb-3">
                <label className="field-label">Nombre del portafolio</label>
                <input className="form-control field-input" placeholder="Ej. Portafolio 1"
                  value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
              </div>
              {error && <div className="alert-bar danger">{error}</div>}
              <button className="btn-action btn-gold w-100" disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
