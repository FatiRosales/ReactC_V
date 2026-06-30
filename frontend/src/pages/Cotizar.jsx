import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Cotizar() {
  const [catalogo, setCatalogo] = useState([]);
  const [estado, setEstado] = useState("cargando");
  const [mensaje, setMensaje] = useState(null);

  const [simbolo, setSimbolo] = useState("");
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editPrecio, setEditPrecio] = useState("");

  function cargar() {
    api.listarCatalogo()
      .then((data) => { setCatalogo(data); setEstado("listo"); })
      .catch(() => setEstado("error"));
  }

  useEffect(cargar, []);

  async function agregar(e) {
    e.preventDefault();
    if (!simbolo.trim() || !nombre.trim() || precio === "") {
      setMensaje({ tipo: "danger", texto: "Completa símbolo, nombre y precio." });
      return;
    }
    setGuardando(true);
    setMensaje(null);
    try {
      await api.crearEnCatalogo({ simbolo: simbolo.trim(), nombre: nombre.trim(), precio: Number(precio) });
      setSimbolo(""); setNombre(""); setPrecio("");
      setMensaje({ tipo: "success", texto: "Acción agregada al catálogo." });
      cargar();
    } catch (err) {
      setMensaje({ tipo: "danger", texto: err.message });
    } finally {
      setGuardando(false);
    }
  }

  function comenzarEdicion(item) {
    setEditId(item.id);
    setEditPrecio(item.precio);
  }

  async function guardarPrecio(id) {
    try {
      await api.actualizarPrecio(id, { precio: Number(editPrecio) });
      setEditId(null);
      cargar();
    } catch (err) {
      setMensaje({ tipo: "danger", texto: err.message });
    }
  }

  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Catálogo</p>
        <h1>Cotizar</h1>
        <p className="lead-muted">Define el precio fijo de cada acción disponible para comprar y vender.</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="panel">
            <h6 className="panel-title">Agregar acción</h6>
            <form onSubmit={agregar}>
              <div className="mb-3">
                <label className="field-label">Símbolo</label>
                <input className="form-control field-input" placeholder="Ej. NVDA"
                  value={simbolo} onChange={(e) => setSimbolo(e.target.value.toUpperCase())} />
              </div>
              <div className="mb-3">
                <label className="field-label">Nombre</label>
                <input className="form-control field-input" placeholder="Ej. NVIDIA Corp."
                  value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="field-label">Precio fijo</label>
                <div className="price-input">
                  <span>$</span>
                  <input type="number" min="0" step="0.01" className="form-control field-input"
                    value={precio} onChange={(e) => setPrecio(e.target.value)} />
                </div>
              </div>
              {mensaje && <div className={`alert-bar ${mensaje.tipo}`}>{mensaje.texto}</div>}
              <button className="btn-action btn-gold w-100" disabled={guardando}>
                {guardando ? "Guardando…" : "Agregar al catálogo"}
              </button>
            </form>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="panel p-0">
            <h6 className="panel-title px-4 pt-4">Acciones disponibles</h6>
            {estado === "error" && <div className="alert-bar danger mx-4">No se pudo cargar el catálogo.</div>}
            <table className="data-table mb-0">
              <thead>
                <tr><th>Símbolo</th><th>Nombre</th><th className="text-end">Precio</th><th></th></tr>
              </thead>
              <tbody>
                {catalogo.map((item) => (
                  <tr key={item.id}>
                    <td><span className="ticker-pill">{item.simbolo}</span></td>
                    <td className="text-muted">{item.nombre}</td>
                    <td className="text-end num">
                      {editId === item.id ? (
                        <input type="number" step="0.01" autoFocus
                          className="form-control field-input edit-price-input"
                          value={editPrecio} onChange={(e) => setEditPrecio(e.target.value)} />
                      ) : (
                        `$${Number(item.precio).toFixed(2)}`
                      )}
                    </td>
                    <td className="text-end">
                      {editId === item.id ? (
                        <button className="btn-link-action" onClick={() => guardarPrecio(item.id)}>Guardar</button>
                      ) : (
                        <button className="btn-link-action" onClick={() => comenzarEdicion(item)}>Editar precio</button>
                      )}
                    </td>
                  </tr>
                ))}
                {estado === "listo" && catalogo.length === 0 && (
                  <tr><td colSpan="4" className="text-muted text-center py-4">Aún no hay acciones en el catálogo.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
