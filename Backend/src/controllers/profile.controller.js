import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { handleUploadErrors,  upload } from "../utils/cloudinary.js";

export const updateProfile = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
  
      upload.single("profileImage")(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: "File upload error", error: err.message });
        }
  
        const { profileTitle, bio, backgroundColor, existingImage } = req.body;
        let imageUrl = existingImage; // Use existing image if present
  
        if (req.file) {
          imageUrl = req.file.path;
        }
  
        if (!profileTitle || !bio) {
          return res.status(400).json({ message: "Profile title and bio are required" });
        }
  
        const updates = {
          profileTitle,
          bio,
          backgroundColor,
          profileImage: imageUrl
        };
  
        const user = await User.findByIdAndUpdate(
          userId,
          updates,
          { new: true, runValidators: true }
        );
  
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "Profile updated successfully", user });
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };



export const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id; // Assuming user is authenticated & added to req
        if (!userId) return res.status(401).json({ message: "Unauthorized access" });

        const user = await User.findById(userId).select("-password"); // Exclude sensitive fields
        if (!user) return res.status(404).json({ message: "No profile found" });

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
};
