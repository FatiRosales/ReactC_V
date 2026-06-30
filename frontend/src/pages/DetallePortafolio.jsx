import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";

export default function DetallePortafolio() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [estado, setEstado] = useState("cargando");

  useEffect(() => {
    api.obtenerPortafolio(id)
      .then((res) => { setData(res); setEstado("listo"); })
      .catch(() => setEstado("error"));
  }, [id]);

  if (estado === "cargando") return <p className="lead-muted">Cargando…</p>;
  if (estado === "error") return <div className="alert-bar danger">No se pudo cargar el portafolio.</div>;

  const { portafolio, compras, ventas } = data;

  return (
    <div>
      <div className="page-head d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <p className="eyebrow">Portafolio</p>
          <h1>{portafolio.nombre}</h1>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn-action btn-buy" to="/comprar">Comprar</Link>
          <Link className="btn-action btn-sell" to="/vender">Vender</Link>
        </div>
      </div>

      <h6 className="section-subtitle">Compras</h6>
      <div className="panel p-0 mb-4">
        <table className="data-table mb-0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Símbolo</th>
              <th className="text-end">Cantidad comprada</th>
              <th className="text-end">Precio de compra</th>
            </tr>
          </thead>
          <tbody>
            {compras.length === 0 && (
              <tr><td colSpan="4" className="text-muted text-center py-4">Este portafolio aún no tiene compras registradas.</td></tr>
            )}
            {compras.map((c) => (
              <tr key={c.id}>
                <td className="text-muted">{c.nombre || "—"}</td>
                <td><span className="ticker-pill">{c.simbolo}</span></td>
                <td className="text-end num">{Number(c.cantidad)}</td>
                <td className="text-end num">${Number(c.precio).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h6 className="section-subtitle">Ventas</h6>
      <div className="panel p-0">
        <table className="data-table mb-0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Símbolo</th>
              <th className="text-end">Cantidad vendida</th>
              <th className="text-end">Precio de compra</th>
              <th className="text-end">Precio de venta</th>
              <th className="text-end">Ganancia / Pérdida</th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 && (
              <tr><td colSpan="6" className="text-muted text-center py-4">Este portafolio aún no tiene ventas registradas.</td></tr>
            )}
            {ventas.map((v) => {
              const valor = Number(v.ganancia_perdida);
              return (
                <tr key={v.id}>
                  <td className="text-muted">{v.nombre || "—"}</td>
                  <td><span className="ticker-pill">{v.simbolo}</span></td>
                  <td className="text-end num">{Number(v.cantidad)}</td>
                  <td className="text-end num">${Number(v.precio_compra).toFixed(2)}</td>
                  <td className="text-end num">${Number(v.precio_venta).toFixed(2)}</td>
                  <td className={`text-end num ${valor >= 0 ? "text-gain" : "text-loss"}`}>
                    {valor >= 0 ? "+" : ""}${valor.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
