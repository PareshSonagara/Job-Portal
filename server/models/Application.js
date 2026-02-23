import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;
// application
// schema design
const applicationSchema = mongoose.Schema(
  {
    job: {
      type: ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      type: String,
    },
    coverLetter: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "accepted", "rejected"],
      default: "pending",
    },
    feedback: {
      type: String,
      default: null,
    },
    feedbackAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;
