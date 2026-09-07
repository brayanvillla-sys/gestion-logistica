const mongoose = require("mongoose");

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

const firmaSchema = new mongoose.Schema(
  {
    firma: { type: String, required: true },
    firmanteNombre: { type: String, trim: true, default: "" },
    firmanteId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    fecha: { type: Date, default: Date.now },
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
      enum: ["programado", "en_revision", "en_ejecucion", "finalizado", "certificado"],
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
    firmasRequeridas: {
      type: Number,
      default: 1,
      min: 1,
      max: 2,
    },
    firmas: {
      type: [firmaSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evento", eventoSchema);