// routes/search.routes.js
import express from "express";
import { searchVideos } from "../controllers/search.controllers.js";

const router = express.Router();

router.get("/", searchVideos);

export default router;
