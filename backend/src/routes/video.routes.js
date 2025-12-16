import { Router } from 'express';
import {
    deleteVideo,
    getAllUsersVideos,
    getAllVideos,
    getVideoById,
    getViewscountOfVideo,
    publishAVideo,
    
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import {upload} from "../middlewares/multer.middlewares.js"

const router = Router();

/* ---------- PUBLIC ROUTES ---------- */
router.get("/all", getAllUsersVideos);
router.get("/:videoId", getVideoById);
router.get("/", getAllVideos);


/* ---------- PROTECTED ROUTES ---------- */
router.use(verifyJWT);

router.post(
  "/",
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);

router.patch("/toggle/:videoId", togglePublishStatus);
router.delete("/:videoId", deleteVideo);
router.patch("/:videoId", upload.single("thumbnail"), updateVideo);
router.put("/:videoId/views", getViewscountOfVideo);

export default router;
