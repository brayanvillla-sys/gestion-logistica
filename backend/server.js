require("dotenv").config();
const express = require("express");
const cors = require("cors");
const conectarDB = require("./config/db");

const app = express();

conectarDB();

app.use(cors());
app.use(express.json());

// Servir las fotos subidas
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ mensaje: "API Gestion Logistica funcionando" });
});

// Rutas
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/usuarios", require("./routes/usuarioRoutes"));
app.use("/api/solicitudes", require("./routes/solicitudRoutes"));
app.use("/api/eventos", require("./routes/eventoRoutes"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en 159.223.175.81:${PORT}`);
});