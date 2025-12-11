import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

 const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Delete file from local after upload
    fs.unlinkSync(localFilePath);

    return result.secure_url; // MUST return whole object
  } catch (error) {
    console.log("Cloudinary upload error:", error);
    return null;
  }
};




export {uploadOnCloudinary}