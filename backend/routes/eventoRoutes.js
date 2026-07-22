const express = require("express");
const router = express.Router();
const {
  crearEvento,
  listarEventos,
  obtenerEvento,
  actualizarEvento,
  eliminarEvento,
} = require("../controllers/eventoController");
const { proteger, autorizar } = require("../middleware/auth");

router.post("/", proteger, autorizar("operador", "admin"), crearEvento);
router.get("/", proteger, listarEventos);
router.get("/:id", proteger, obtenerEvento);
router.put("/:id", proteger, autorizar("operador", "admin"), actualizarEvento);
router.delete("/:id", proteger, autorizar("admin"), eliminarEvento);

module.exports = router;