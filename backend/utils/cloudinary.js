import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
  api_key: process.env.CLOUDINARY_API_KEY.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "shops",
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result.secure_url;
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.log("CLOUDINARY ERROR:", error.message);
    return null;
  }
};

export default uploadOnCloudinary;
