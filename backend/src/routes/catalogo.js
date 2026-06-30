const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/catalogo - listar acciones disponibles con su precio fijo (pantalla "Cotizar")
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM catalogo ORDER BY simbolo");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/catalogo - agregar una acción nueva al catálogo con precio fijo
router.post("/", async (req, res) => {
  const { simbolo, nombre, precio } = req.body;
  if (!simbolo || !nombre || precio == null) {
    return res.status(400).json({ error: "simbolo, nombre y precio son obligatorios." });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO catalogo (simbolo, nombre, precio) VALUES ($1, $2, $3) RETURNING *",
      [simbolo.toUpperCase(), nombre, precio]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: `El símbolo ${simbolo.toUpperCase()} ya existe en el catálogo.` });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/catalogo/:id - actualizar el precio fijo de una acción
router.put("/:id", async (req, res) => {
  const { precio, nombre } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE catalogo SET precio = COALESCE($1, precio), nombre = COALESCE($2, nombre) WHERE id = $3 RETURNING *",
      [precio, nombre, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Acción no encontrada en el catálogo." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
