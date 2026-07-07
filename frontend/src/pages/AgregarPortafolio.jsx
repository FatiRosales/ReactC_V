import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
      const data = await api.crearPortafolio(nombre.trim());
      if (data && data.id) {
        navigate(`/portafolios/${data.id}`);
      } else {
        navigate("/");
      }
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
              <div className="mt-3 text-center">
                <Link className="btn-link-action" to="/">← Ver mis portafolios</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
