import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    // nothing to upload
    if (!localFilePath) return null;

    // upload file
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // remove temporary local file after successful upload
    fs.unlinkSync(localFilePath);

    // response contains secure_url, public_id, etc.
    return response;
  } catch (error) {
    console.log("Cloudinary upload error:", error);

    // remove temporary local file if it exists
    if (localFilePath) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

// Delete file from Cloudinary using publicId
const deleteFromCloudinary = async (publicId) => {
  try {
    // nothing to delete
    if (!publicId) return null;

    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log("Cloudinary delete error:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
