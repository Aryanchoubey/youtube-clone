import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

  const uploadOnCloudinaryVideo = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "video",
      folder: "videos",

      // 🔑 THIS ENABLES HLS
      eager: [
        {
          streaming_profile: "hd",
          format: "m3u8"
        }
      ],
      eager_async: true
    });

    fs.unlinkSync(localFilePath);

    return result; // IMPORTANT: return full object
  } catch (error) {
    console.log("Cloudinary upload error:", error);
    return null;
  }
};

const uploadOnCloudinaryImage = async (localFilePath)=>{
  try {
    if(!localFilePath) return null;

    const result = await cloudinary.uploader.upload(localFilePath,{
       resource_type: "image",
      folder: "users"
      

    })
    fs.unlinkSync(localFilePath);
    return result
  } catch (error) {
     console.log("Cloudinary upload thumbail  error:", error);
    return null;
  }
}




export {uploadOnCloudinaryVideo,uploadOnCloudinaryImage};