import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!videoId) {
        throw new ApiError(400, "videoId is missing")
    }
    console.log( videoId);
    
    // console.log( req.user._id);
    
    const userId = req.user._id
    // console.log( userId);
    
    if (!userId) {
        throw new ApiError(400, "userId is missing")
    }
    const toggleLike = await Like.findOne({
        video:new mongoose.Types.ObjectId (videoId),
        likedBy:new mongoose.Types.ObjectId(userId)
    })
    console.log( toggleLike);
    
    
    if (toggleLike) {
      const notLike=  await Like.findByIdAndDelete(toggleLike._id)
        return res
        .status(200)
        .json(new ApiResponse (200, notLike , "unliked successfully"))
       
    }
   
    const liked = await Like.create({
        video:videoId,
        likedBy:userId
    })
    if (!liked) {
        throw new ApiError(400, "video is not liked")
    }
    return res
    .status(200)
    .json(new ApiResponse (200, liked , "liked successfully"))
   
  
   
})
const checkVideoLikeStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "videoId is missing");
  }

  const userId = req.user._id;

  const liked = await Like.findOne({
    video: new mongoose.Types.ObjectId(videoId),
    likedBy: new mongoose.Types.ObjectId(userId)
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked: liked ? true : false },
        "like status fetched"
      )
    );
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!commentId) {
        throw new ApiError(400, "commentId is missing")
    }
     const userId = req.user._id
    // console.log( userId);
    
    if (!userId) {
        throw new ApiError(400, "userId is missing")
    }
    const toggleLikeInComment = await Like.findOne({
         comment:new mongoose.Types.ObjectId (commentId),
        likedBy:new mongoose.Types.ObjectId(userId)
    })
    if (toggleLikeInComment) {
        const notLike= await Like.findByIdAndDelete(toggleLikeInComment._id)
        if (!notLike) {
            throw new ApiError(400," something went wrong")

        }
        return res
        .status(200)
        .json(new ApiResponse(200, notLike , "remove liked in comment successfully"))
    }
    const like= await Like.create({
         comment:new mongoose.Types.ObjectId (commentId),
        likedBy:new mongoose.Types.ObjectId(userId)
    })
    if (!like) {
        throw new ApiError(400, "liked is not done successfully")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, like, "like is done in comment"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    try {
    const userId = req.user._id;

    const likes = await Like.find({ likedBy: userId })
      .populate({
        path: "video",
        populate: { path: "owner", select: "username avatar" , },
      });
//  console.log( likes);
 
    const likedVideos = likes
      .map((item) => item.video)
      .filter((video) => video !== null);

    return res.status(200).json(new ApiResponse(200, likedVideos, "liked video fetched")
     
    );
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
})
const getVideoLikeCount = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) throw new ApiError(400, "videoId is missing");

    const count = await Like.countDocuments({
        video: new mongoose.Types.ObjectId(videoId)
    });

    return res.status(200).json(
        new ApiResponse(200, { count }, "like count fetched")
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    checkVideoLikeStatus,
    getVideoLikeCount
}