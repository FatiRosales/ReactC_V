require("dotenv").config();
const express = require("express");
const cors = require("cors");

const portafoliosRouter = require("./routes/portafolios");
const accionesRouter = require("./routes/acciones");
const catalogoRouter = require("./routes/catalogo");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/portafolios", portafoliosRouter);
app.use("/api/acciones", accionesRouter);
app.use("/api/catalogo", catalogoRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
