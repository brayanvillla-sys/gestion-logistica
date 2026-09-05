const multer = require("multer");
const path = require("path");
const fs = require("fs");

const carpeta = path.join(__dirname, "..", "uploads");

// Crea la carpeta si no existe
if (!fs.existsSync(carpeta)) {
  fs.mkdirSync(carpeta, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, carpeta),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, nombreUnico);
  },
});

// Solo acepta imágenes, máximo 5MB cada una
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;