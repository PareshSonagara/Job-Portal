import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;
import validator from "validator";

// schema design
const companySchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Please provide a title for this job."],
      trim: true,
      unique: [true, "Company must be unique"],
      lowercase: true,
      minLength: [3, "Title must be at least 3 characters."],
      maxLenght: [100, "Title is too large"],
    },
    managerName: {
      type: ObjectId,
      ref: "User",
      unique: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    companyWebsite: {
      type: String,
      required: [true, "Please provide a company website."],
      validate: [validator.isURL, "Please provide a valid url"],
    },
    jobPosts: [
      {
        type: ObjectId,
        ref: "Job",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model("Company", companySchema);

export default Company;
