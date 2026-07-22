const express = require("express");
const router = express.Router();
const {
  crearEvento,
  listarEventos,
  obtenerEvento,
  actualizarEvento,
  eliminarEvento,
} = require("../controllers/eventoController");

router.post("/", crearEvento);
router.get("/", listarEventos);
router.get("/:id", obtenerEvento);
router.put("/:id", actualizarEvento);
router.delete("/:id", eliminarEvento);

module.exports = router;