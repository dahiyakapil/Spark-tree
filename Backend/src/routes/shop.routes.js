import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createShop, deleteShop, getUserShopLinks } from "../controllers/shop.controller.js";



const shopRouter = express.Router();

shopRouter.post("/createShop", authMiddleware, createShop);
shopRouter.get("/", authMiddleware, getUserShopLinks);
shopRouter.delete("/:linkId", authMiddleware, deleteShop);

export default shopRouter;
