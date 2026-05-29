import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

// Upload function
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // File has been uploaded successfully.
    // console.log("File has been uploaded to cloudinary", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localFilePath); //remove the
    // locally saved temporary file as upload on cloudinary has been completed
    return null;
  }
};

// helper: extract public_id
const getPublicIdFromUrl = (url) => {
  if (!url) return null;

  const fileName = url.split("/").pop(); // avatar123.jpg
  const publicId = fileName.split(".")[0]; // avatar123

  return publicId;
};

// delete function
const deleteFromCloudinary = async (url) => {
  try {
    if (!url) return null;

    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return null;

    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log("Cloudinary delete error:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
