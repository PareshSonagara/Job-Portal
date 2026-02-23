import User from "../models/User.js";

export const signupService = async (userInfo) => {
  const user = await User.create(userInfo);
  return user;
};

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const findUserByToken = async (token) => {
  return await User.findOne({ confirmationToken: token });
};

export const findUserById = async (id) => {
  return await User.findById(id);
};

export const allCandidatesService = async (filters) => {
  const candidates = await User.find({ role: "Candidate", ...filters });
  return candidates;
};

export const allHiringManagersService = async (filters) => {
  const managers = await User.find({ role: "Hiring-Manager", ...filters });
  return managers;
};

export const candidateByIdService = async (id) => {
  const candidate = await User.findById(id);
  return candidate;
};
