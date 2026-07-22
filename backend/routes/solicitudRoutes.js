const express = require("express");
const router = express.Router();
const {
  crearSolicitud,
  listarSolicitudes,
  obtenerSolicitud,
  actualizarSolicitud,
  eliminarSolicitud,
} = require("../controllers/solicitudController");

router.post("/", crearSolicitud);
router.get("/", listarSolicitudes);
router.get("/:id", obtenerSolicitud);
router.put("/:id", actualizarSolicitud);
router.delete("/:id", eliminarSolicitud);

module.exports = router;