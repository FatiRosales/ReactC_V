import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Vender() {
  const [portafolios, setPortafolios] = useState([]);
  const [portafolioId, setPortafolioId] = useState("");
  const [posiciones, setPosiciones] = useState([]);
  const [simbolo, setSimbolo] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [precio, setPrecio] = useState("");
  const [resultado, setResultado] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    api.listarPortafolios().then(setPortafolios).catch(() => {});
  }, []);

  useEffect(() => {
    setPosiciones([]);
    setSimbolo("");
    setResultado(null);
    if (!portafolioId) return;
    api.obtenerPortafolio(portafolioId)
      .then((data) => setPosiciones(data.posiciones.filter((p) => Number(p.cantidad_actual) > 0)))
      .catch(() => {});
  }, [portafolioId]);

  const posicion = posiciones.find((p) => p.simbolo === simbolo);

  async function vender(e) {
    e.preventDefault();
    if (!portafolioId || !simbolo || !cantidad || precio === "") {
      setMensaje({ tipo: "danger", texto: "Completa portafolio, acción, cantidad y precio de venta." });
      return;
    }
    setCargando(true);
    setMensaje(null);
    setResultado(null);
    try {
      const data = await api.vender({
        portafolio_id: Number(portafolioId),
        simbolo,
        cantidad: Number(cantidad),
        precio: Number(precio),
      });
      setResultado(data);
      api.obtenerPortafolio(portafolioId)
        .then((d) => setPosiciones(d.posiciones.filter((p) => Number(p.cantidad_actual) > 0)));
    } catch (err) {
      setMensaje({ tipo: "danger", texto: err.message });
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Operación · Venta</p>
        <h1>Vender</h1>
        <p className="lead-muted">Elige a qué precio vendes y verás de inmediato tu ganancia o pérdida.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-7">
          <div className="panel">
            <form onSubmit={vender}>
              <div className="mb-3">
                <label className="field-label">Portafolio</label>
                <select className="form-select field-input" value={portafolioId} onChange={(e) => setPortafolioId(e.target.value)}>
                  <option value="">Selecciona un portafolio</option>
                  {portafolios.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="field-label">Acción a vender</label>
                <select className="form-select field-input" value={simbolo} onChange={(e) => setSimbolo(e.target.value)} disabled={!portafolioId}>
                  <option value="">{portafolioId ? "Selecciona una acción en existencia" : "Primero elige un portafolio"}</option>
                  {posiciones.map((p) => (
                    <option key={p.simbolo} value={p.simbolo}>{p.simbolo} — disponibles: {Number(p.cantidad_actual)}</option>
                  ))}
                </select>
                {portafolioId && posiciones.length === 0 && (
                  <div className="form-text-muted">Este portafolio no tiene acciones disponibles para vender.</div>
                )}
              </div>

              <div className="row">
                <div className="col-6 mb-3">
                  <label className="field-label">Cantidad</label>
                  <input type="number" min="1" max={posicion ? Number(posicion.cantidad_actual) : undefined}
                    className="form-control field-input" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                </div>
                <div className="col-6 mb-3">
                  <label className="field-label">Precio de venta</label>
                  <div className="price-input">
                    <span>$</span>
                    <input type="number" min="0" step="0.01" className="form-control field-input"
                      value={precio} onChange={(e) => setPrecio(e.target.value)} />
                  </div>
                </div>
              </div>

              {mensaje && <div className={`alert-bar ${mensaje.tipo}`}>{mensaje.texto}</div>}

              <button className="btn-action btn-sell w-100" disabled={cargando}>
                {cargando ? "Procesando…" : "Confirmar venta"}
              </button>
            </form>

            {resultado && (
              <div className={`result-box ${Number(resultado.ganancia_perdida) >= 0 ? "gain" : "loss"}`}>
                <div className="result-row">
                  <span>Precio promedio de compra</span>
                  <strong>${Number(resultado.precio_compra_promedio).toFixed(2)}</strong>
                </div>
                <div className="result-row">
                  <span>Precio de venta</span>
                  <strong>${Number(resultado.precio_venta).toFixed(2)}</strong>
                </div>
                <div className="result-row total">
                  <span>{Number(resultado.ganancia_perdida) >= 0 ? "Ganancia" : "Pérdida"}</span>
                  <strong>
                    {Number(resultado.ganancia_perdida) >= 0 ? "+" : ""}
                    ${Number(resultado.ganancia_perdida).toFixed(2)}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
