import { v2 as cloudinary } from "cloudinary";

const { CLOUDINARY_CLOUD, CLOUDINARY_KEY, CLOUDINARY_SECRET, CLOUDINARY_URL } =
  process.env;

if (!CLOUDINARY_URL) {
  if (!CLOUDINARY_CLOUD || !CLOUDINARY_KEY || !CLOUDINARY_SECRET) {
    throw new Error(
      "Cloudinary config missing. Set CLOUDINARY_CLOUD, CLOUDINARY_KEY and CLOUDINARY_SECRET in your .env or set CLOUDINARY_URL."
    );
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD,
    api_key: CLOUDINARY_KEY,
    api_secret: CLOUDINARY_SECRET,
  });
} else {
  cloudinary.config({ secure: true });
}

export default cloudinary;
