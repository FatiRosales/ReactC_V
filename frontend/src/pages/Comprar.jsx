import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function Comprar() {
  const [portafolios, setPortafolios] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [portafolioId, setPortafolioId] = useState("");
  const [catalogoId, setCatalogoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    api.listarPortafolios().then(setPortafolios).catch(() => {});
    api.listarCatalogo().then(setCatalogo).catch(() => {});
  }, []);

  const seleccionada = catalogo.find((c) => String(c.id) === String(catalogoId));
  const total = seleccionada ? Number(seleccionada.precio) * Number(cantidad || 0) : 0;

  async function comprar(e) {
    e.preventDefault();
    if (!portafolioId || !catalogoId || !cantidad) {
      setMensaje({ tipo: "danger", texto: "Selecciona un portafolio, una acción y la cantidad." });
      return;
    }
    setCargando(true);
    setMensaje(null);
    try {
      const data = await api.comprar({
        portafolio_id: Number(portafolioId),
        catalogo_id: Number(catalogoId),
        cantidad: Number(cantidad),
      });
      setMensaje({
        tipo: "success",
        texto: `Compra registrada: ${data.cantidad} ${seleccionada.simbolo} a $${Number(data.precio).toFixed(2)} c/u. Se guardó en el portafolio.`,
      });
    } catch (err) {
      setMensaje({ tipo: "danger", texto: err.message });
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Operación · Compra</p>
        <h1>Comprar</h1>
        <p className="lead-muted">Elige la acción del catálogo, la cantidad y el portafolio donde quieres guardarla.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-7">
          <div className="panel">
            {portafolios.length === 0 && (
              <div className="alert-bar warning mb-4">
                Todavía no tienes portafolios. <Link to="/agregar-portafolio">Crea uno primero</Link>.
              </div>
            )}
            <form onSubmit={comprar}>
              <div className="mb-3">
                <label className="field-label">Portafolio destino</label>
                <select className="form-select field-input" value={portafolioId} onChange={(e) => setPortafolioId(e.target.value)}>
                  <option value="">Selecciona un portafolio</option>
                  {portafolios.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="field-label">Acción</label>
                <select className="form-select field-input" value={catalogoId} onChange={(e) => setCatalogoId(e.target.value)}>
                  <option value="">Selecciona una acción</option>
                  {catalogo.map((c) => (
                    <option key={c.id} value={c.id}>{c.simbolo} · {c.nombre} — ${Number(c.precio).toFixed(2)}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="field-label">Cantidad</label>
                <input type="number" min="1" className="form-control field-input"
                  value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
              </div>

              {seleccionada && (
                <div className="summary-box">
                  <div><span>Precio fijo</span><strong>${Number(seleccionada.precio).toFixed(2)}</strong></div>
                  <div><span>Total a invertir</span><strong className="num-gold">${total.toFixed(2)}</strong></div>
                </div>
              )}

              {mensaje && <div className={`alert-bar ${mensaje.tipo}`}>{mensaje.texto}</div>}

              <button className="btn-action btn-buy w-100" disabled={cargando}>
                {cargando ? "Procesando…" : "Confirmar compra"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
