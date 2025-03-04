import express from "express";
import { updateProfile, getProfile } from "../controllers/profile.controller.js";
import { upload } from "../utils/cloudinary.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const profileRouter = express.Router();

profileRouter.put("/setprofile", updateProfile);
profileRouter.get("/getProfile", authMiddleware, getProfile);

export default profileRouter;
