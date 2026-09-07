const express = require("express");
const router = express.Router();
const {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  guardarMiFirma,
} = require("../controllers/usuarioController");
const { proteger, autorizar } = require("../middleware/auth");

router.put("/mi-firma", proteger, guardarMiFirma);
router.post("/", proteger, autorizar("admin"), crearUsuario);
router.get("/", proteger, autorizar("admin", "operador"), listarUsuarios);
router.get("/:id", proteger, obtenerUsuario);
router.put("/:id", proteger, autorizar("admin"), actualizarUsuario);
router.delete("/:id", proteger, autorizar("admin"), eliminarUsuario);

module.exports = router;