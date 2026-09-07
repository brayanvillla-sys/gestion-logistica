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
  enviarAFirma,
  firmarEvento,
  rechazarFirma,
} = require("../controllers/eventoController");
const { proteger, autorizar } = require("../middleware/auth");
const upload = require("../config/multer");

router.post("/", proteger, autorizar("operador", "admin"), crearEvento);
router.get("/", proteger, listarEventos);
router.get("/por-solicitud/:solicitudId", proteger, obtenerPorSolicitud);
router.get("/:id", proteger, obtenerEvento);
router.put("/:id", proteger, autorizar("operador", "admin"), actualizarEvento);
router.delete("/:id", proteger, autorizar("admin"), eliminarEvento);

router.post("/:id/fotos", proteger, autorizar("operador", "admin"), upload.array("fotos", 10), subirFotos);
router.delete("/:id/fotos/:fotoId", proteger, autorizar("operador", "admin"), eliminarFoto);

router.put("/:id/enviar-firma", proteger, autorizar("operador", "admin"), enviarAFirma);
router.put("/:id/firmar", proteger, autorizar("supervisor", "admin"), firmarEvento);
router.put("/:id/rechazar-firma", proteger, autorizar("supervisor", "admin"), rechazarFirma);

module.exports = router;