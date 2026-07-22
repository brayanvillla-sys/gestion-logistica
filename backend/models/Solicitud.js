const mongoose = require("mongoose");

// Sub-esquema: cada item que pide la secretaria
const itemSchema = new mongoose.Schema(
  {
    categoria: {
      type: String,
      required: true,
      trim: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: [1, "La cantidad minima es 1"],
    },
    descripcion: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const solicitudSchema = new mongoose.Schema(
  {
    nombreEvento: {
      type: String,
      required: [true, "El nombre del evento es obligatorio"],
      trim: true,
    },
    fechaEvento: {
      type: Date,
      required: [true, "La fecha del evento es obligatoria"],
    },
    lugar: {
      type: String,
      required: [true, "El lugar es obligatorio"],
      trim: true,
    },
    dependencia: {
      type: String,
      required: [true, "La dependencia es obligatoria"],
      trim: true,
    },
    items: {
      type: [itemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Debe incluir al menos un item",
      },
    },
    contactoNombre: { type: String, trim: true, default: "" },
    contactoTelefono: { type: String, trim: true, default: "" },
    estado: {
      type: String,
      enum: ["pendiente", "aprobada", "rechazada"],
      default: "pendiente",
    },
    solicitante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Solicitud", solicitudSchema);