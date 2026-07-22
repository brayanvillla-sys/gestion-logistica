const Solicitud = require("../models/Solicitud");

const crearSolicitud = async (req, res) => {
  try {
    const solicitud = new Solicitud(req.body);
    await solicitud.save();
    res.status(201).json(solicitud);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear solicitud", error: error.message });
  }
};

const listarSolicitudes = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.estado) filtro.estado = req.query.estado;

    const solicitudes = await Solicitud.find(filtro)
      .populate("solicitante", "nombre email dependencia")
      .sort({ createdAt: -1 });

    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al listar solicitudes", error: error.message });
  }
};

const obtenerSolicitud = async (req, res) => {
  try {
    const solicitud = await Solicitud.findById(req.params.id)
      .populate("solicitante", "nombre email dependencia");

    if (!solicitud) {
      return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    }
    res.json(solicitud);
  } catch (error) {
    res.status(400).json({ mensaje: "ID invalido", error: error.message });
  }
};

const actualizarSolicitud = async (req, res) => {
  try {
    const solicitud = await Solicitud.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!solicitud) {
      return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    }
    res.json(solicitud);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al actualizar", error: error.message });
  }
};

const eliminarSolicitud = async (req, res) => {
  try {
    const solicitud = await Solicitud.findByIdAndDelete(req.params.id);
    if (!solicitud) {
      return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    }
    res.json({ mensaje: "Solicitud eliminada correctamente" });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al eliminar", error: error.message });
  }
};

module.exports = {
  crearSolicitud,
  listarSolicitudes,
  obtenerSolicitud,
  actualizarSolicitud,
  eliminarSolicitud,
};