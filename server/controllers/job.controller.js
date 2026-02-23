import Company from "../models/Company.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { uploadToGoogleDrive } from "../middleware/googleDriveService.js";
import {
  createJobService,
  updateJobService,
  getAllJobsService,
  getJobByIdService,
  getHighestPaidJobsService,
  getMostAppliedJobsService,
} from "../services/job.service.js";

export const createJob = async (req, res, _next) => {
  try {
    //check user token to find manager's company id. if it doesnt match with req.body.companyInfo then return
    const { email } = req.user;
    const manager = await User.findOne({ email });
    //get the company in which this manager is assigned
    let company = await Company.findOne({ managerName: manager._id });

    const { companyInfo, companyName, companyWebsite, location } = req.body;

    // If no company exists, create one from request data
    if (!company) {
      if (!companyName || !companyWebsite || !location) {
        return res.status(400).json({
          status: "fail",
          message: "Company not found. Please provide companyName, companyWebsite, and location.",
        });
      }

      company = await Company.create({
        companyName,
        companyWebsite,
        location,
        managerName: manager._id,
      });
    }

    // If companyInfo is provided, ensure it matches manager company
    if (companyInfo && company._id.toString() !== companyInfo.toString()) {
      return res.status(400).json({
        status: "fail",
        message: "You are not authorized to create job for this company",
      });
    }

    // deadline must be atleast 1 day from now otherwise return
    //deadline formate 2022-01-01
    const { deadline } = req.body;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= today) {
      return res.status(400).json({
        status: "fail",
        message: "Deadline must be atleast 1 day from now",
      });
    }

    // save or create

    // Map frontend fields to backend model
    const payload = {
      jobTitle: req.body.jobTitle || req.body.title,
      jobPosition: req.body.jobPosition || req.body.title,
      jobNature: req.body.jobNature || req.body.jobType,
      jobDescription: req.body.jobDescription || req.body.description,
      salary: req.body.salary,
      deadline,
      companyInfo: company._id,
      skills: req.body.skills || [],
      requirements: req.body.requirements || [],
    };

    const result = await createJobService(payload);

    // Push the new job into the company's jobPosts array
    await Company.updateOne({ _id: company._id }, { $push: { jobPosts: result._id } });

    res.status(200).json({
      status: "success",
      message: "Job created successfully!",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: " Data is not inserted ",
      error: error.message,
    });
  }
};

export const getJobsByManagerToken = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({ email }).select(
      "-password -__v -createdAt -updatedAt -role -status -appliedJobs"
    );
    const company = await Company.findOne({ managerName: user._id });

    //get all jobs
    const jobs = await Job.find({}).populate({
      path: "companyInfo",
      select: "-jobPosts",
    });
    //find the jobs by company id
    const jobsByCompany = jobs.filter((job) => {
      return job.companyInfo?._id?.toString() == company._id.toString();
    });

    const jobsWithCounts = jobsByCompany.map((job) => ({
      ...job.toObject(),
      applicationsCount: job.applications?.length || 0,
    }));

    res.status(200).json({
      status: "success",
      data: {
        managerInfo: user,
        jobs: jobsWithCounts,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "can't get the data",
      error: error.message,
    });
  }
};

export const getJobByManagerTokenJobId = async (req, res) => {
  try {
    //get all jobs
    const jobs = await Job.find({})
      .populate({
        path: "companyInfo",
        select: "-jobPosts",
      })
      .populate({
        path: "applications",
        populate: {
          path: "applicant",
          select: "-password -__v -createdAt -updatedAt -role -status -appliedJobs",
        },
        select: "-job",
      })
      .populate({
        path: "companyInfo",
        select: "-jobPosts",
        populate: {
          path: "managerName",
          select: "-password -__v -createdAt -updatedAt -role -status -appliedJobs",
        },
      });

    //find the required job from jobs  with req.params id
    const { id } = req.params;
    const job = jobs.find((job) => {
      return job._id.toString() == id.toString();
    });

    if (!job) {
      return res.status(404).json({
        status: "fail",
        message: "Job not found",
      });
    }

    //check if managerName.email is equal to req.user.email
    if (req.user.email !== job.companyInfo.managerName.email) {
      return res.status(400).json({
        status: "fail",
        message: "You are not authorized to get internal data of this job",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        job,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "can't get the data",
      error: error.message,
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { email } = req.user;
    const manager = await User.findOne({ email });

    // Find the manager's company
    const company = await Company.findOne({ managerName: manager._id });
    if (!company) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have a company. Create a job first.",
      });
    }

    // Find the job and verify it belongs to this manager's company
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ status: "fail", message: "Job not found" });
    }

    if (job.companyInfo.toString() !== company._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update this job",
      });
    }

    const result = await updateJobService(req.params.id, req.body);

    res.status(200).json({
      status: "success",
      message: "Job updated successfully!",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "Data is not updated",
      error: error.message,
    });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    //{price:{$ gt:50}
    //{ price: { gt: '50' } }

    let filters = { ...req.query };

    //sort , page , limit -> exclude
    const excludeFields = ["sort", "page", "limit"];
    excludeFields.forEach((field) => delete filters[field]);

    //gt ,lt ,gte .lte
    let filtersString = JSON.stringify(filters);
    filtersString = filtersString.replace(/\b(gt|gte|lt|lte|ne|eq)\b/g, (match) => `$${match}`);

    filters = JSON.parse(filtersString);

    const queries = {};

    if (req.query.sort) {
      // price,qunatity   -> 'price quantity'
      const sortBy = req.query.sort.split(",").join(" ");
      queries.sortBy = sortBy;
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      queries.fields = fields;
    }

    if (req.query.page) {
      const { page = 1, limit = 10 } = req.query; // "3" "10"

      const skip = (page - 1) * parseInt(limit);
      queries.skip = skip;
      queries.limit = parseInt(limit);
    }

    const jobs = await getAllJobsService(filters, queries);

    res.status(200).json({
      status: "success",
      data: jobs,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "can't get the data",
      error: error.message,
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await getJobByIdService(id);

    res.status(200).json({
      status: "success",
      data: job,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "can't get the data",
      error: error.message,
    });
  }
};

export const applyJob = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({ email }).select(
      "-password -__v -createdAt -updatedAt -role -status -appliedJobs"
    );

    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(400).json({
        status: "fail",
        message: "Job not found",
      });
    }

    //check if application date is less or equal to deadline date
    const today = new Date();
    const deadline = new Date(job.deadline);
    if (today > deadline) {
      return res.status(400).json({
        status: "fail",
        message: "Application deadline is over. try next time",
      });
    }

    //check if user has already applied for this job
    // get all the applications that have been applied for this job and find if the user has already applied
    const applications = await Application.find({ job: job._id });
    const isApplied = applications.find(
      (application) => application.applicant.toString() == user._id.toString()
    );

    if (isApplied) {
      return res.status(400).json({
        status: "fail",
        message: "You have already applied for this job",
      });
    }

    // Determine resume URL: use uploaded file or the saved profile resume
    let resumeLink;
    if (req.file) {
      // Upload to Google Drive using buffer-based service
      resumeLink = await uploadToGoogleDrive(req.file);
      // Local file deletion no longer needed for Memory Storage
    } else if (req.body.profileResumeURL) {
      resumeLink = req.body.profileResumeURL;
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Please upload your resume or save one to your profile first",
      });
    }

    const application = await Application.create({
      job: job._id,
      applicant: user._id,
      resume: resumeLink,
      coverLetter: req.body.coverLetter || "",
    });

    await Job.updateOne({ _id: job._id }, { $push: { applications: application._id } });

    await User.updateOne({ _id: user._id }, { $push: { appliedJobs: application._id } });

    res.status(200).json({
      status: "success",
      message: "Job applied successfully!",
      result: {
        data: application,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "can't get the data",
      error: error.message,
    });
  }
};

export const getHighestPaidJobs = async (req, res) => {
  try {
    const jobs = await getHighestPaidJobsService();

    res.status(200).json({
      status: "success",
      data: jobs,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "can't get the data",
      error: error.message,
    });
  }
};

export const getMostAppliedJobs = async (req, res) => {
  try {
    const jobs = await getMostAppliedJobsService();

    res.status(200).json({
      status: "success",
      data: jobs,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "can't get the data",
      error: error.message,
    });
  }
};

// PATCH /jobs/:jobId/applications/:appId/status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { jobId, appId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "reviewing", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ status: "fail", message: "Invalid status value" });
    }

    const { email } = req.user;
    const manager = await User.findOne({ email });
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ status: "fail", message: "Job not found" });
    const company = await Company.findById(job.companyInfo).select("managerName");
    if (!company || company.managerName?.toString() !== manager._id.toString()) {
      return res.status(403).json({ status: "fail", message: "Not authorized" });
    }

    const application = await Application.findByIdAndUpdate(
      appId,
      { status },
      { new: true, runValidators: true }
    ).populate("applicant", "firstName lastName email");

    if (!application)
      return res.status(404).json({ status: "fail", message: "Application not found" });

    res.status(200).json({ status: "success", data: application });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

export const getPortalStats = async (req, res) => {
  try {
    const jobCount = await Job.countDocuments();
    const companyCount = await Company.countDocuments();
    const candidateCount = await User.countDocuments({ role: "Candidate" });
    const placementCount = await Application.countDocuments({ status: "accepted" });

    res.status(200).json({
      status: "success",
      data: {
        jobs: jobCount,
        companies: companyCount,
        candidates: candidateCount,
        placements: placementCount,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "Could not fetch stats",
      error: error.message,
    });
  }
};

// PATCH /jobs/:jobId/applications/:appId/feedback
export const updateApplicationFeedback = async (req, res) => {
  try {
    const { jobId, appId } = req.params;
    const { feedback } = req.body;

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({ status: "fail", message: "Feedback cannot be empty" });
    }

    const { email } = req.user;
    const manager = await User.findOne({ email });
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ status: "fail", message: "Job not found" });
    const company = await Company.findById(job.companyInfo).select("managerName");
    if (!company || company.managerName?.toString() !== manager._id.toString()) {
      return res.status(403).json({ status: "fail", message: "Not authorized" });
    }

    const application = await Application.findByIdAndUpdate(
      appId,
      { feedback: feedback.trim(), feedbackAt: new Date() },
      { new: true }
    ).populate("applicant", "firstName lastName email");

    if (!application)
      return res.status(404).json({ status: "fail", message: "Application not found" });

    res.status(200).json({ status: "success", data: application });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};
