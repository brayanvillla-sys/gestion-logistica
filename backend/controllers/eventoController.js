const Evento = require("../models/Evento");
const Solicitud = require("../models/Solicitud");
const fs = require("fs");
const path = require("path");

const crearEvento = async (req, res) => {
  try {
    const { solicitud: solicitudId } = req.body;

    const solicitud = await Solicitud.findById(solicitudId);
    if (!solicitud) {
      return res.status(404).json({ mensaje: "La solicitud no existe" });
    }

    // Copia los items de la solicitud, numerados y con valor en 0
    const itemsHeredados = solicitud.items.map((it, i) => ({
      numero: i + 1,
      categoria: it.categoria,
      descripcion: it.descripcion || "",
      cantidad: it.cantidad,
      valorUnidad: 0,
    }));

    const evento = new Evento({
      solicitud: solicitud._id,
      nombre: req.body.nombre || solicitud.nombreEvento,
      fecha: req.body.fecha || solicitud.fechaEvento,
      lugar: req.body.lugar || solicitud.lugar,
      dependencia: solicitud.dependencia || "",
      responsable: req.body.responsable,
      valorTotal: req.body.valorTotal || 0,
      proyecto: req.body.proyecto || "",
      rubro: req.body.rubro || "",
      codigoAlojamiento: req.body.codigoAlojamiento || "",
      observaciones: req.body.observaciones || "",
      items: itemsHeredados,
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

// GET /api/eventos/por-solicitud/:solicitudId
const obtenerPorSolicitud = async (req, res) => {
  try {
    const evento = await Evento.findOne({ solicitud: req.params.solicitudId })
      .populate("responsable", "nombre email");

    if (!evento) {
      return res.status(404).json({ mensaje: "No hay evento para esta solicitud" });
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

// POST /api/eventos/:id/fotos
const subirFotos = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ mensaje: "Evento no encontrado" });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ mensaje: "No se recibieron imagenes" });
    }

    const nuevas = req.files.map((f) => ({
      url: `/uploads/${f.filename}`,
      nombre: f.originalname,
    }));

    evento.fotos.push(...nuevas);
    await evento.save();

    res.status(201).json(evento);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al subir fotos", error: error.message });
  }
};

// DELETE /api/eventos/:id/fotos/:fotoId
const eliminarFoto = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ mensaje: "Evento no encontrado" });
    }

    const foto = evento.fotos.id(req.params.fotoId);
    if (!foto) {
      return res.status(404).json({ mensaje: "Foto no encontrada" });
    }

    const rutaArchivo = path.join(__dirname, "..", foto.url);
    if (fs.existsSync(rutaArchivo)) {
      fs.unlinkSync(rutaArchivo);
    }

    foto.deleteOne();
    await evento.save();

    res.json({ mensaje: "Foto eliminada", evento });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al eliminar foto", error: error.message });
  }
};

module.exports = {
  crearEvento,
  listarEventos,
  obtenerEvento,
  obtenerPorSolicitud,
  actualizarEvento,
  eliminarEvento,
  subirFotos,
  eliminarFoto,
};