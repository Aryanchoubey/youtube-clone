import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    checkVideoLikeStatus,
    getVideoLikeCount,
} from "../controllers/likes.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/:userId").get(getLikedVideos);
router.get("/status/v/:videoId", verifyJWT, checkVideoLikeStatus);
router.get("/count/v/:videoId", verifyJWT, getVideoLikeCount);


export default router