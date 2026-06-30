import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function MisPortafolios() {
  const [portafolios, setPortafolios] = useState([]);
  const [estado, setEstado] = useState("cargando");

  useEffect(() => {
    api.listarPortafolios()
      .then((data) => { setPortafolios(data); setEstado("listo"); })
      .catch(() => setEstado("error"));
  }, []);

  const totalGeneral = portafolios.reduce((acc, p) => acc + Number(p.ganancia_perdida), 0);

  return (
    <div>
      <div className="page-head d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <p className="eyebrow">Resumen</p>
          <h1>Mis Portafolios</h1>
          <p className="lead-muted">Así va el desempeño de cada uno de tus portafolios.</p>
        </div>
        <Link className="btn-action btn-gold" to="/agregar-portafolio">+ Agregar portafolio</Link>
      </div>

      {estado === "listo" && portafolios.length > 0 && (
        <div className={`total-banner ${totalGeneral >= 0 ? "gain" : "loss"}`}>
          <span>Resultado consolidado de todos tus portafolios</span>
          <strong>{totalGeneral >= 0 ? "+" : ""}${totalGeneral.toFixed(2)}</strong>
        </div>
      )}

      {estado === "cargando" && <p className="lead-muted">Cargando portafolios…</p>}
      {estado === "error" && (
        <div className="alert-bar danger">No se pudo conectar con la API. Revisa que el backend esté corriendo en el puerto 4000.</div>
      )}
      {estado === "listo" && portafolios.length === 0 && (
        <div className="alert-bar warning">Todavía no tienes portafolios. Crea el primero para empezar a operar.</div>
      )}

      <div className="row g-4 mt-1">
        {portafolios.map((p) => {
          const valor = Number(p.ganancia_perdida);
          const positivo = valor >= 0;
          return (
            <div className="col-12 col-md-6 col-lg-4" key={p.id}>
              <Link to={`/portafolios/${p.id}`} className="portfolio-card-link">
                <div className="portfolio-card">
                  <div className="portfolio-card-top">
                    <span className="portfolio-card-name">{p.nombre}</span>
                    <span className={`trend-badge ${positivo ? "up" : "down"}`}>{positivo ? "▲" : "▼"}</span>
                  </div>
                  <div className={`portfolio-card-amount ${positivo ? "gain" : "loss"}`}>
                    {positivo ? "+" : ""}${valor.toFixed(2)}
                  </div>
                  <div className="portfolio-card-date">Creado el {new Date(p.fecha_creacion).toLocaleDateString()}</div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
