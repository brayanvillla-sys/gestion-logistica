const Evento = require("../models/Evento");
const Solicitud = require("../models/Solicitud");

const crearEvento = async (req, res) => {
  try {
    const { solicitud: solicitudId } = req.body;

    const solicitud = await Solicitud.findById(solicitudId);
    if (!solicitud) {
      return res.status(404).json({ mensaje: "La solicitud no existe" });
    }

    const evento = new Evento({
      solicitud: solicitud._id,
      nombre: req.body.nombre || solicitud.nombreEvento,
      fecha: req.body.fecha || solicitud.fechaEvento,
      lugar: req.body.lugar || solicitud.lugar,
      responsable: req.body.responsable,
      valorTotal: req.body.valorTotal || 0,
      observaciones: req.body.observaciones || "",
    });

    await evento.save();

    solicitud.estado = "aprobada";
    await solicitud.save();

    res.status(201).json(evento);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear evento", error: error.message });
  }
};

const listarEventos = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.estado) filtro.estado = req.query.estado;

    const eventos = await Evento.find(filtro)
      .populate("solicitud", "nombreEvento dependencia items")
      .populate("responsable", "nombre email")
      .sort({ fecha: -1 });

    res.json(eventos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al listar eventos", error: error.message });
  }
};

const obtenerEvento = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id)
      .populate("solicitud")
      .populate("responsable", "nombre email");

    if (!evento) {
      return res.status(404).json({ mensaje: "Evento no encontrado" });
    }
    res.json(evento);
  } catch (error) {
    res.status(400).json({ mensaje: "ID invalido", error: error.message });
  }
};

const actualizarEvento = async (req, res) => {
  try {
    const evento = await Evento.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!evento) {
      return res.status(404).json({ mensaje: "Evento no encontrado" });
    }
    res.json(evento);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al actualizar", error: error.message });
  }
};

const eliminarEvento = async (req, res) => {
  try {
    const evento = await Evento.findByIdAndDelete(req.params.id);
    if (!evento) {
      return res.status(404).json({ mensaje: "Evento no encontrado" });
    }
    res.json({ mensaje: "Evento eliminado correctamente" });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al eliminar", error: error.message });
  }
};

module.exports = {
  crearEvento,
  listarEventos,
  obtenerEvento,
  actualizarEvento,
  eliminarEvento,
};