const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
};

// POST /api/auth/registro
const registro = async (req, res) => {
  try {
    const { nombre, email, password, rol, dependencia } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: "Nombre, email y contrasena son obligatorios" });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: "Ese email ya esta registrado" });
    }

    const usuario = new Usuario({ nombre, email, password, rol, dependencia });
    await usuario.save();

    res.status(201).json({
      token: generarToken(usuario),
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        dependencia: usuario.dependencia,
      },
    });
  } catch (error) {
    res.status(400).json({ mensaje: "Error en el registro", error: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: "Email y contrasena son obligatorios" });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales invalidas" });
    }

    if (!usuario.activo) {
      return res.status(403).json({ mensaje: "Usuario inactivo" });
    }

    const coincide = await usuario.compararPassword(password);
    if (!coincide) {
      return res.status(401).json({ mensaje: "Credenciales invalidas" });
    }

    res.json({
      token: generarToken(usuario),
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        dependencia: usuario.dependencia,
      },
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el login", error: error.message });
  }
};

// GET /api/auth/perfil  (protegida)
const perfil = async (req, res) => {
  res.json(req.usuario);
};

module.exports = { registro, login, perfil };