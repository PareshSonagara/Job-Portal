const User = require("../models/User");

exports.signupService = async (userInfo) => {
  const user = await User.create(userInfo);
  return user;
};

exports.findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

exports.findUserByToken = async (token) => {
  return await User.findOne({ confirmationToken: token });
};

exports.findUserById = async (id) => {
  return await User.findById(id);
};

exports.allCandidatesService = async (filters) => {
  const candidates = await User.find({ role: "Candidate", ...filters });
  return candidates;
};

exports.allHiringManagersService = async (filters) => {
  const managers = await User.find({ role: "Hiring-Manager", ...filters });
  return managers;
};

exports.candidateByIdService = async (id) => {
  const candidate = await User.findById(id);
  return candidate;
};
