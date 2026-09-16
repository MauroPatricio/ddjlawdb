import multer from 'multer';
import path from 'path';
import fs from 'fs';

const docsDir = path.join(process.cwd(), 'uploads', 'documents');
const logosDir = path.join(process.cwd(), 'uploads', 'logos');

// Garantir que as diretorias de uploads existem
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === 'logo') {
      cb(null, logosDir);
    } else {
      cb(null, docsDir);
    }
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'logo' ? 'logo' : 'doc';
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'logo') {
    const isImage = file.mimetype.startsWith('image/') || /\.(png|jpg|jpeg|webp|svg)$/i.test(file.originalname);
    if (isImage) {
      cb(null, true);
    } else {
      cb(new Error('Apenas ficheiros de imagem (PNG, JPG, WEBP, SVG) são permitidos para o logotipo!'), false);
    }
  } else if (file.fieldname === 'document') {
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      cb(null, true);
    } else {
      cb(new Error('Apenas ficheiros em formato PDF são permitidos para o documento!'), false);
    }
  } else {
    cb(null, true);
  }
};

export const uploadInformationFiles = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Limite de 15MB
  fileFilter,
}).fields([
  { name: 'document', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
]);

export const uploadPDF = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter,
});
