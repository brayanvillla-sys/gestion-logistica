const mongoose = require("mongoose");

// Ítems del evento: los mismos de la solicitud, pero el operador les pone precio y orden
const itemEventoSchema = new mongoose.Schema(
  {
    numero: { type: Number, default: 0 },
    categoria: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true, default: "" },
    cantidad: { type: Number, required: true, min: 1 },
    valorUnidad: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const eventoSchema = new mongoose.Schema(
  {
    solicitud: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Solicitud",
      required: [true, "El evento debe venir de una solicitud"],
    },
    nombre: {
      type: String,
      required: [true, "El nombre del evento es obligatorio"],
      trim: true,
    },
    fecha: {
      type: Date,
      required: [true, "La fecha es obligatoria"],
    },
    lugar: {
      type: String,
      required: [true, "El lugar es obligatorio"],
      trim: true,
    },
    dependencia: {
      type: String,
      trim: true,
      default: "",
    },
    responsable: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
    estado: {
      type: String,
      enum: ["programado", "en_ejecucion", "finalizado", "certificado"],
      default: "programado",
    },
    valorTotal: {
      type: Number,
      default: 0,
      min: [0, "El valor no puede ser negativo"],
    },
    proyecto: {
      type: String,
      trim: true,
      default: "",
    },
    rubro: {
      type: String,
      trim: true,
      default: "",
    },
    codigoAlojamiento: {
      type: String,
      trim: true,
      default: "",
    },
    observaciones: {
      type: String,
      trim: true,
      default: "",
    },
    items: {
      type: [itemEventoSchema],
      default: [],
    },
    fotos: [
      {
        url: { type: String, required: true },
        nombre: { type: String, default: "" },
        subidaEn: { type: Date, default: Date.now },
      },
    ],
    firma: {
      type: String,
      default: "",
    },
    firmanteNombre: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evento", eventoSchema);