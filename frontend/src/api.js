const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error en la solicitud");
  return data;
}

export const api = {
  // Catálogo (pantalla "Cotizar") — acciones disponibles con precio fijo
  listarCatalogo: () => request("/catalogo"),
  crearEnCatalogo: (payload) =>
    request("/catalogo", { method: "POST", body: JSON.stringify(payload) }),
  actualizarPrecio: (id, payload) =>
    request(`/catalogo/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  // Portafolios
  listarPortafolios: () => request("/portafolios"),
  crearPortafolio: (nombre) =>
    request("/portafolios", { method: "POST", body: JSON.stringify({ nombre }) }),
  obtenerPortafolio: (id) => request(`/portafolios/${id}`),

  // Operaciones — el precio de compra sale del catálogo; el de venta lo decide el usuario
  comprar: (payload) =>
    request("/acciones/comprar", { method: "POST", body: JSON.stringify(payload) }),
  vender: (payload) =>
    request("/acciones/vender", { method: "POST", body: JSON.stringify(payload) }),
};
