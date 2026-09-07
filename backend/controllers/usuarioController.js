const Usuario = require("../models/Usuario");

// CREATE - POST /api/usuarios
const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol, dependencia } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: "Ese email ya esta registrado" });
    }

    const usuario = new Usuario({ nombre, email, password, rol, dependencia });
    await usuario.save();

    const respuesta = usuario.toObject();
    delete respuesta.password;

    res.status(201).json(respuesta);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear usuario", error: error.message });
  }
};

// READ ALL - GET /api/usuarios
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-password").sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al listar usuarios", error: error.message });
  }
};

// READ ONE - GET /api/usuarios/:id
const obtenerUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select("-password");
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ mensaje: "ID invalido", error: error.message });
  }
};

// UPDATE - PUT /api/usuarios/:id
const actualizarUsuario = async (req, res) => {
  try {
    const { nombre, rol, dependencia, activo } = req.body;

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombre, rol, dependencia, activo },
      { new: true, runValidators: true }
    ).select("-password");

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al actualizar", error: error.message });
  }
};

// DELETE - DELETE /api/usuarios/:id
const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al eliminar", error: error.message });
  }
};

// PUT /api/usuarios/mi-firma  (el propio usuario guarda su firma)
const guardarMiFirma = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario._id,
      { firma: req.body.firma || "" },
      { new: true }
    ).select("-password");
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al guardar firma", error: error.message });
  }
};

module.exports = {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  guardarMiFirma,
};