const Job = require("../models/Job");

exports.createJobService = async (data) => {
  const job = await Job.create(data);
  return job;
};

exports.updateJobService = async (jobId, data) => {
  const result = await Job.updateOne({ _id: jobId }, { $set: data }, { runValidators: true });
  return result;
};

exports.getAllJobsService = async (filters, queries) => {
  const jobs = await Job.find(filters)
    .skip(queries.skip)
    .limit(queries.limit)
    .select(queries.fields)
    .sort(queries.sortBy)
    .populate({
      path: "companyInfo",
      select: "companyName location companyWebsite",
    });

  const totalJobs = await Job.countDocuments(filters);
  const limitValue = queries.limit || totalJobs || 1;
  const pageCount = Math.ceil(totalJobs / limitValue);

  return { jobs, totalJobs, pageCount };
};

exports.getJobByIdService = async (id) => {
  const job = await Job.findById(id).populate({
    path: "companyInfo",
    select: "companyName location companyWebsite",
  });
  return job;
};

exports.applyJobService = async (jobId, data) => {
  const result = await Job.updateOne(
    { _id: jobId },
    { $push: { applicants: data } }
  );
  return result;
};

exports.getHighestPaidJobsService = async () => {
  const jobs = await Job.find()
    .sort({ salary: -1 })
    .limit(10)
    .populate({
      path: "companyInfo",
      select: "companyName location companyWebsite",
    });
  return jobs;
};

exports.getMostAppliedJobsService = async () => {
  const jobs = await Job.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate({
      path: "companyInfo",
      select: "companyName location companyWebsite",
    });
  return jobs;
};
