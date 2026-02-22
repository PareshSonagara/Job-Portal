const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<object>} - Cloudinary upload result
 */
exports.uploadToCloudinary = (buffer, folder = "job-portal-profiles") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: folder, resource_type: "auto" },
            (error, result) => {
                if (error) return reject(new Error(`Cloudinary Upload Failed: ${error.message}`));
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};
