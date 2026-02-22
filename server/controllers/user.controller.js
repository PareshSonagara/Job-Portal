// Company model is not needed directly in user controller
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const {
  signupService,
  findUserByEmail,
  findUserById,
  allCandidatesService,
  allHiringManagersService,
  candidateByIdService,
} = require("../services/user.service");
const { generateToken } = require("../utils/token");
const { uploadToCloudinary } = require("../middleware/cloudinaryService");
const { uploadToGoogleDrive, deleteLocalFile } = require("../middleware/googleDriveService");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Signup ────────────────────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    req.body.status = "active"; // Auto-activate: no email confirmation needed
    const user = await signupService(req.body);
    const { password: pwd, ...userWithoutPassword } = user.toObject();
    res.status(200).json({
      status: "success",
      message: "Successfully signed up! You can now log in.",
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", error: error.message });
  }
};

// ─── Login ──────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        status: "fail",
        error: "Please provide your credentials",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        error: "No user found. Please create an account",
      });
    }

    const isPasswordValid = user.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({
        status: "fail",
        error: "Password is not correct",
      });
    }

    const { password: pwd, ...others } = user.toObject();
    const token = generateToken(others);

    res.status(200).json({
      status: "success",
      message: "Successfully logged in",
      data: { user: others, token },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", error });
  }
};

// ─── Google Login ─────────────────────────────────────────────────────────────
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ status: "fail", error: "Token is required" });
    }

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      return res.status(401).json({ status: "fail", error: "Invalid Google token" });
    }

    const payload = ticket.getPayload();
    const { sub, email, given_name, family_name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        email,
        firstName: given_name || email.split('@')[0],
        lastName: family_name || "User",
        googleId: sub,
        imageURL: picture,
        status: "active",
        role: "Candidate",
      });
    } else if (!user.googleId) {
      // Link Google account to existing email if not already linked
      user.googleId = sub;
      if (!user.imageURL) user.imageURL = picture;
      await user.save({ validateBeforeSave: false });
    }

    const { password: pwd, ...others } = user.toObject();
    const token = generateToken(others);

    res.status(200).json({
      status: "success",
      message: "Google login successful",
      data: { user: others, token },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", error: error.message });
  }
};

// ─── Get My Profile ─────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user?.email }).populate({
      path: "appliedJobs",
      populate: {
        path: "job",
        select: "jobTitle companyInfo salary",
        populate: { path: "companyInfo", select: "companyName location" },
      },
    });
    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    res.status(500).json({ status: "fail", error });
  }
};

// ─── Update Profile ─────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, contactNumber, dateOfBirth, imageURL, resumeURL } = req.body;
    const user = await findUserByEmail(req.user?.email);

    if (!user) {
      return res.status(404).json({ status: "fail", error: "User not found" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (contactNumber) user.contactNumber = contactNumber;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (imageURL) user.imageURL = imageURL;
    if (resumeURL) user.resumeURL = resumeURL;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", error });
  }
};

// ─── Change Password (using old password) ───────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validate all fields present
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "fail",
        error: "Please provide oldPassword, newPassword, and confirmPassword",
      });
    }

    // New passwords must match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "fail",
        error: "New password and confirm password do not match",
      });
    }

    // Old and new password must not be the same
    if (oldPassword === newPassword) {
      return res.status(400).json({
        status: "fail",
        error: "New password must be different from the old password",
      });
    }

    // Find the user (with password field — normally excluded)
    const user = await User.findOne({ email: req.user?.email });
    if (!user) {
      return res.status(404).json({ status: "fail", error: "User not found" });
    }

    // Verify old password
    const isOldPasswordValid = bcrypt.compareSync(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(403).json({
        status: "fail",
        error: "Old password is incorrect",
      });
    }

    // Set new password & confirm (pre-save hook will hash it)
    user.password = newPassword;
    user.confirmPassword = confirmPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    res.status(500).json({ status: "fail", error: error.message });
  }
};

// ─── Upload Profile Image ────────────────────────────────────────────────────
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "fail", error: "No image file uploaded" });
    }

    // Upload to Cloudinary using buffer
    const cloudResult = await uploadToCloudinary(req.file.buffer);
    const imageURL = cloudResult.secure_url;

    // Local file deletion no longer needed for Memory Storage

    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { imageURL },
      { new: true, select: "-password -__v" }
    );
    res.status(200).json({ status: "success", data: { imageURL, user } });
  } catch (error) {
    res.status(500).json({ status: "fail", error: error.message });
  }
};

// ─── Upload Profile Resume ────────────────────────────────────────────────────
exports.uploadProfileResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "fail", error: "No PDF file uploaded" });
    }

    // Upload to Google Drive using buffer-based service
    const resumeURL = await uploadToGoogleDrive(req.file);

    // Local file deletion no longer needed for Memory Storage

    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { resumeURL },
      { new: true, select: "-password -__v" }
    );
    res.status(200).json({ status: "success", data: { resumeURL, user } });
  } catch (error) {
    res.status(500).json({ status: "fail", error: error.message });
  }
};

// ─── Check Email Exists ─────────────────────────────────────────────────────────
exports.checkEmailExists = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ status: "fail", error: "Email is required" });
    }
    const user = await findUserByEmail(email);
    res.status(200).json({ status: "success", exists: !!user });
  } catch (error) {
    res.status(500).json({ status: "fail", error });
  }
};

// ─── Admin: Get All Candidates ──────────────────────────────────────────────────
exports.getCandidates = async (req, res) => {
  try {
    const candidates = await allCandidatesService();
    res.status(200).json({ status: "success", data: candidates });
  } catch (error) {
    res.status(500).json({ status: "fail", error });
  }
};

// ─── Admin: Get Candidate By ID ─────────────────────────────────────────────────
exports.getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await candidateByIdService(id);
    if (!candidate) {
      return res.status(404).json({ status: "fail", error: "No candidate found" });
    }
    res.status(200).json({ status: "success", data: candidate });
  } catch (error) {
    res.status(500).json({ status: "fail", error });
  }
};

// ─── Admin: Get All Hiring Managers ────────────────────────────────────────────
exports.getManagers = async (req, res) => {
  try {
    const hiringManagers = await allHiringManagersService();
    res.status(200).json({ status: "success", data: hiringManagers });
  } catch (error) {
    res.status(500).json({ status: "fail", error });
  }
};

// ─── Admin: Promote User Role ───────────────────────────────────────────────────
exports.promoteUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await findUserById(id);

    if (!user) {
      return res.status(404).json({ status: "fail", error: "No user found" });
    }

    if (req.user.email === user.email) {
      return res.status(403).json({
        status: "fail",
        error: "You cannot change your own role",
      });
    }

    const { role } = req.body;
    const validRoles = ["Admin", "Hiring-Manager", "Candidate"];

    if (!validRoles.includes(role)) {
      return res.status(403).json({
        status: "fail",
        error: `Invalid role. Allowed: ${validRoles.join(", ")}`,
      });
    }

    if (user.role === role) {
      return res.status(403).json({
        status: "fail",
        error: `User is already a ${role}`,
      });
    }

    user.role = role;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: `Successfully promoted user to ${role}`,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", error });
  }
};