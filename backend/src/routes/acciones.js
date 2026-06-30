const express = require("express");
const pool = require("../db");

const router = express.Router();

// POST /api/acciones/comprar - { portafolio_id, catalogo_id, cantidad }
// El precio se toma del catálogo (precio fijo), no se manda desde el frontend.
router.post("/comprar", async (req, res) => {
  const { portafolio_id, catalogo_id, cantidad } = req.body;
  if (!portafolio_id || !catalogo_id || !cantidad) {
    return res.status(400).json({ error: "portafolio_id, catalogo_id y cantidad son obligatorios." });
  }
  try {
    const accion = await pool.query("SELECT * FROM catalogo WHERE id = $1", [catalogo_id]);
    if (accion.rows.length === 0) {
      return res.status(404).json({ error: "La acción seleccionada no existe en el catálogo." });
    }
    const { simbolo, precio } = accion.rows[0];

    const { rows } = await pool.query(
      `INSERT INTO transacciones (portafolio_id, tipo, simbolo, cantidad, precio)
       VALUES ($1, 'compra', $2, $3, $4) RETURNING *`,
      [portafolio_id, simbolo, cantidad, precio]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/acciones/vender - { portafolio_id, simbolo, cantidad, precio }
// El precio de venta sí lo decide el usuario (puede ser distinto al de compra).
router.post("/vender", async (req, res) => {
  const { portafolio_id, simbolo, cantidad, precio } = req.body;
  if (!portafolio_id || !simbolo || !cantidad || precio == null) {
    return res.status(400).json({ error: "portafolio_id, simbolo, cantidad y precio son obligatorios." });
  }
  try {
    const disponible = await pool.query(`
      SELECT COALESCE(SUM(CASE WHEN tipo = 'compra' THEN cantidad ELSE -cantidad END), 0) AS cantidad_actual
      FROM transacciones WHERE portafolio_id = $1 AND simbolo = $2;
    `, [portafolio_id, simbolo.toUpperCase()]);

    const cantidadActual = Number(disponible.rows[0].cantidad_actual);
    if (cantidad > cantidadActual) {
      return res.status(400).json({ error: `No hay suficientes acciones de ${simbolo} para vender. Disponible: ${cantidadActual}` });
    }

    const costoPromedio = await pool.query(`
      SELECT COALESCE(SUM(cantidad * precio) / SUM(cantidad), 0) AS precio_promedio_compra
      FROM transacciones WHERE portafolio_id = $1 AND simbolo = $2 AND tipo = 'compra';
    `, [portafolio_id, simbolo.toUpperCase()]);

    const precioPromedioCompra = Number(costoPromedio.rows[0].precio_promedio_compra);
    const gananciaPerdida = (precio - precioPromedioCompra) * cantidad;

    const venta = await pool.query(
      `INSERT INTO transacciones (portafolio_id, tipo, simbolo, cantidad, precio, precio_compra_ref, ganancia_perdida)
       VALUES ($1, 'venta', $2, $3, $4, $5, $6) RETURNING *`,
      [portafolio_id, simbolo.toUpperCase(), cantidad, precio, precioPromedioCompra, gananciaPerdida]
    );

    res.status(201).json({
      transaccion: venta.rows[0],
      precio_compra_promedio: precioPromedioCompra,
      precio_venta: Number(precio),
      ganancia_perdida: gananciaPerdida,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

