import multer from "multer";
import path from "path";

// Switch to Memory Storage
const storage = multer.memoryStorage();

const pdfUploader = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const supportedDocuments = /pdf/;
    const extension = path.extname(file.originalname);

    if (supportedDocuments.test(extension)) {
      cb(null, true);
    } else {
      cb(new Error("Must be a pdf file"));
    }
  },
  limits: {
    fileSize: 5000000,
  },
});

export default pdfUploader;
