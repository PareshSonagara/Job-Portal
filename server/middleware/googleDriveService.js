const { google } = require("googleapis");
const streamifier = require("streamifier");

/**
 * Initializes Google OAuth2 Client
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

// Set Refresh Token
const setAuth = () => {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
};

/**
 * Uploads a file buffer to Google Drive
 * @param {object} file - Express file object (req.file)
 * @returns {Promise<string>} - Public viewable URL of the uploaded file
 */
exports.uploadToGoogleDrive = async (file) => {
  console.log(`🚀 Starting Google Drive upload for: ${file.originalname}`);
  try {
    setAuth();
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const fileMetadata = {
      name: `${Date.now()}-${file.originalname}`,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: file.mimetype,
      body: streamifier.createReadStream(file.buffer),
    };

    console.log("📤 Creating file on Google Drive...");
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink",
    });

    console.log(`✅ File created! ID: ${response.data.id}`);

    // Make the file publicly viewable (read-only)
    console.log("🔓 Setting public permissions...");
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    console.log("🌐 Public link generated successfully");
    return response.data.webViewLink;
  } catch (error) {
    console.error("❌ Google Drive Upload Error:", error.message);
    if (error.response) {
      console.error("📋 Error Data:", error.response.data);
    }
    throw new Error(`Google Drive Upload Failed: ${error.message}`);
  }
};

/**
 * No-op for memory storage compatibility 
 */
exports.deleteLocalFile = (filePath) => {
  // Logic not required for Memory Storage, but kept for signature compatibility
};
