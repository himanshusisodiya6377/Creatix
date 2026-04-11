import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with HTTPS
cloudinary.config({
  secure: true,
  private_cdn: false,
});

export default cloudinary;
