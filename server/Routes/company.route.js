import express from "express";
import * as companyController from "../controllers/company.controller.js";
import authorization from "../middleware/authorization.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Company Routes
router
  .route("/")
  .get(companyController.getCompanies)
  .post(verifyToken, authorization("Admin", "Hiring-Manager"), companyController.createCompany);

router.route("/:id").get(companyController.getCompanyById);

export default router;
