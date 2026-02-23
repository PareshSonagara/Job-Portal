import multer from "multer";
import path from "path";

// Switch to Memory Storage so files never touch the server disk
const storage = multer.memoryStorage();

// ── Image uploader (profile photos) ─────────────────────────────────────────
export const imageUploader = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── Resume/PDF uploader ──────────────────────────────────────────────────────
export const resumeUploader = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});
