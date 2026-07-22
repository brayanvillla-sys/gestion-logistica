const mongoose = require("mongoose");

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
    observaciones: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evento", eventoSchema);