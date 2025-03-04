import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage Configuration
const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
        folder: "profile-images", // Folder in Cloudinary
        allowed_formats: ["jpg", "png", "jpeg"],
        public_id: `profile_${Date.now()}_${Math.round(Math.random() * 1E6)}`, // Unique file name
        transformation: [{ width: 500, height: 500, crop: "limit" }], // Resize
    }),
});

// Multer Upload Configuration
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only .png, .jpg and .jpeg formats are allowed!"), false);
        }
        cb(null, true);
    },
});

// Error Handling Middleware
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Multer Error: ${err.message}` });
    } else if (err) {
        return res.status(400).json({ message: `Upload Error: ${err.message}` });
    }
    next();
};

export { cloudinary, upload, handleUploadErrors };
