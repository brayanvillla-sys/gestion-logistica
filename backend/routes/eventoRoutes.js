const express = require("express");
const router = express.Router();
const {
  crearEvento,
  listarEventos,
  obtenerEvento,
  obtenerPorSolicitud,
  actualizarEvento,
  eliminarEvento,
  subirFotos,
  eliminarFoto,
} = require("../controllers/eventoController");
const { proteger, autorizar } = require("../middleware/auth");
const upload = require("../config/multer");

router.post("/", proteger, autorizar("operador", "admin"), crearEvento);
router.get("/", proteger, listarEventos);
router.get("/por-solicitud/:solicitudId", proteger, obtenerPorSolicitud);
router.get("/:id", proteger, obtenerEvento);
router.put("/:id", proteger, autorizar("operador", "admin"), actualizarEvento);
router.delete("/:id", proteger, autorizar("admin"), eliminarEvento);

// Fotos de evidencia
router.post("/:id/fotos", proteger, autorizar("operador", "admin"), upload.array("fotos", 10), subirFotos);
router.delete("/:id/fotos/:fotoId", proteger, autorizar("operador", "admin"), eliminarFoto);

module.exports = router;