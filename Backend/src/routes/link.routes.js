import express from "express";
import { createLink, getUserLinks, deleteLink } from "../controllers/link.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const linkRouter = express.Router();

linkRouter.post("/create", authMiddleware, createLink);
linkRouter.get("/", authMiddleware, getUserLinks);
linkRouter.delete("/:linkId", authMiddleware, deleteLink);

export default linkRouter;
