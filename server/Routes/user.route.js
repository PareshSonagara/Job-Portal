import express from "express";
import * as userController from "../controllers/user.controller.js";
import authorization from "../middleware/authorization.js";
import verifyToken from "../middleware/verifyToken.js";
import { imageUploader, resumeUploader } from "../middleware/fileUploader.js";

const router = express.Router();

// Auth Routes (no email required)
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/google-login", userController.googleLogin);

// Profile Routes (protected)
router.get("/me", verifyToken, userController.getMe);
router.patch("/me", verifyToken, userController.updateProfile);

// File Uploads (protected)
router.post(
  "/upload-image",
  verifyToken,
  imageUploader.single("image"),
  userController.uploadProfileImage
);
router.post(
  "/upload-resume",
  verifyToken,
  resumeUploader.single("resume"),
  userController.uploadProfileResume
);

// Change Password (protected — uses old password to verify identity)
router.patch("/change-password", verifyToken, userController.changePassword);

// Email check (used during signup)
router.get("/check-email/:email", userController.checkEmailExists);

// Admin Routes
router.get("/candidates", verifyToken, authorization("Admin"), userController.getCandidates);
router.get("/candidate/:id", verifyToken, authorization("Admin"), userController.getCandidateById);
router.get("/hiring-managers", verifyToken, authorization("Admin"), userController.getManagers);
router.put("/promote/:id", verifyToken, authorization("Admin"), userController.promoteUserRole);

export default router;
