import express from "express";
import * as jobController from "../controllers/job.controller.js";
import authorization from "../middleware/authorization.js";
import pdfUploader from "../middleware/pdfUploader.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();
// Jobs Route
router.route("/jobs/highest-paid-jobs").get(jobController.getHighestPaidJobs);

router.route("/jobs/most-applied-jobs").get(jobController.getMostAppliedJobs);
router.route("/jobs/stats").get(jobController.getPortalStats);

router
  .route("/jobs")
  .get(jobController.getAllJobs)
  .post(verifyToken, authorization("Admin", "Hiring-Manager"), jobController.createJob);

router
  .route("/manager/jobs")
  .get(verifyToken, authorization("Admin", "Hiring-Manager"), jobController.getJobsByManagerToken);

router
  .route("/manager/jobs/:id")
  .get(
    verifyToken,
    authorization("Admin", "Hiring-Manager"),
    jobController.getJobByManagerTokenJobId
  );

router
  .route("/jobs/:id")
  .get(jobController.getJobById)
  .patch(verifyToken, authorization("Admin", "Hiring-Manager"), jobController.updateJob);

router
  .route("/jobs/:id/apply")
  .post(
    verifyToken,
    authorization("Candidate"),
    pdfUploader.single("resume"),
    jobController.applyJob
  );

router
  .route("/jobs/:jobId/applications/:appId/status")
  .patch(
    verifyToken,
    authorization("Admin", "Hiring-Manager"),
    jobController.updateApplicationStatus
  );

router
  .route("/jobs/:jobId/applications/:appId/feedback")
  .patch(
    verifyToken,
    authorization("Admin", "Hiring-Manager"),
    jobController.updateApplicationFeedback
  );

export default router;
