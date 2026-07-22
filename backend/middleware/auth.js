const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

// Verifica que venga un token valido
const proteger = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ mensaje: "No autorizado, falta el token" });
    }

    const token = header.split(" ")[1];
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findById(decodificado.id).select("-password");
    if (!usuario) {
      return res.status(401).json({ mensaje: "El usuario ya no existe" });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token invalido o expirado" });
  }
};

// Restringe por rol: autorizar("admin", "operador")
const autorizar = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: `El rol '${req.usuario.rol}' no tiene permiso para esta accion`,
      });
    }
    next();
  };
};

module.exports = { proteger, autorizar };