const express = require("express");
const router = express.Router();
const {
  crearSolicitud,
  listarSolicitudes,
  obtenerSolicitud,
  actualizarSolicitud,
  eliminarSolicitud,
} = require("../controllers/solicitudController");
const { proteger, autorizar } = require("../middleware/auth");

router.post("/", proteger, crearSolicitud);
router.get("/", proteger, listarSolicitudes);
router.get("/:id", proteger, obtenerSolicitud);
router.put("/:id", proteger, autorizar("operador", "admin"), actualizarSolicitud);
router.delete("/:id", proteger, autorizar("admin"), eliminarSolicitud);

module.exports = router;