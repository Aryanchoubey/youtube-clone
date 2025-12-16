import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const searchVideos = asyncHandler(async (req, res) => {
  const { q } = req.query;

  // 1️⃣ Validate query
  if (!q || q.trim() === "") {
    return res.status(400).json(
      new ApiResponse(400, [], "Search query is required")
    );
  }

  // 2️⃣ Search videos
  const videos = await Video.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { tags: { $elemMatch: { $regex: q, $options: "i" } } }
    ]
  }).populate("owner","username avatar")
    .sort({ createdAt: -1 }) // latest first
    .limit(20);

  // 3️⃣ Response
  return res.status(200).json(
    new ApiResponse(200, videos, "Search result fetched successfully")
  );
});
