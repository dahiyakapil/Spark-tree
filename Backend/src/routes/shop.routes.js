import express from "express";
import { createLink, getUserLinks, deleteLink } from "../controllers/shop.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const shopRouter = express.Router();

shopRouter.post("/createShop", authMiddleware, createLink);
shopRouter.get("/", authMiddleware, getUserLinks);
shopRouter.delete("/:linkId", authMiddleware, deleteLink);

export default shopRouter;
