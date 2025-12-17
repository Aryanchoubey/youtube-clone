import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { uploadOnCloudinaryImage, uploadOnCloudinaryVideo} from "../utils/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
  let { userId, page = 1, limit = 10 } = req.query;
 const {  } = req.params;
 console.log( userId);
 
  page = Number(page);
  limit = Number(limit);
  const skip = (page - 1) * limit;

  let match = {};

  // ✅ apply owner filter ONLY if userId is provided
  if (userId && userId !== "all") {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid userId");
    }
    match.owner = new mongoose.Types.ObjectId(userId);
  }

  const allVideos = await Video.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        metadata: [
          { $count: "total" },
          { $addFields: { page, limit } }
        ],
        videos: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
            },
          },
          { $unwind: "$owner" },
        ],
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, allVideos[0], "Videos fetched successfully")
  );
});



// import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title?.trim()) {
    throw new ApiError(400, "Title is required");
  }

  const user = req.user._id;

  const videoPath = req.files?.videoFile?.[0]?.path;
  const thumbnailPath = req.files?.thumbnail?.[0]?.path;
  console.log( videoPath);
  

  if (!videoPath) {
    throw new ApiError(400, "Video file is required");
  }

  const videoUrl = await uploadOnCloudinaryVideo(videoPath, "videos");
  const thumbnailUrl = await uploadOnCloudinaryImage(thumbnailPath, "thumbnails");
 console.log( "video url :",videoUrl.public_id);
 
  const video = await Video.create({
    title,
    description,
    owner: user,
    ownerName: req.user.username,

    videoFile: videoUrl.public_id,      // <-- This is now ONLY a string
    thumbnail: thumbnailUrl,  // <-- Also only URL
  });
  
  
  return res.status(200).json(
    new ApiResponse(200, video, "Video uploaded successfully")
  );
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "video id is not found")
    }
    const id = await Video.findById(videoId)
    if (!id) {
        throw new ApiError(400, "video is missing")
    }
   
    
    
    return res
    .status(200)
    .json(new ApiResponse(200,id,"successffully"))
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title , description } = req.body
    if (!(title || description )) {
       throw new ApiError(400,"field are required") 
    }
    // console.log(req.file);
    
     const thumbnailPath = req.file?.path;

     console.log( thumbnailPath);
     
    if (!videoId) {
        throw new ApiError(400, "video id is missing")
    }
    if (!thumbnailPath) {
        throw new ApiError(400, "Thumbnail is missing");
    }
    const video= await Video.findById(videoId)
     if (video.thumbnail) {
        try {
            fs.unlinkSync(video.thumbnail); // remove old file
        } catch (err) {
            console.log("Old thumbnail delete error:", err);
        }
    }
    
    const newVideo = await Video.findByIdAndUpdate(videoId,
        {
            $set:{
                title,
                description,
                thumbnail:thumbnailPath
            }
        },
        {
            new :true
        }
    )
   return res
   .status(200)
   .json(new ApiResponse(200, newVideo,"update the detail "))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId) {
        throw new ApiError(400,"missing video id ")
    }
    const video = await Video.findByIdAndDelete(videoId)
    console.log( video);
    
    if (!video) {
        throw new ApiError(400, "video is missing")
    }
    console.log(video)
    

    return res
    .status(200)
    .json(new ApiResponse (200,"video is deleted successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    console.log(req.params)
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "Video not found");

  const updated = await Video.findByIdAndUpdate(
    videoId,
    { isPublished: !video.isPublished },
    { new: true }
  );

  res.json(updated);
});
const getAllUsersVideos = asyncHandler(async (req,res)=>{
    // const user = req.user.username;
    // console.log( user);
    
  try {
    const videos= await Video.find().sort({createdAt:-1}).populate("owner","username avatar coverImage")
    if (!videos) {
        throw new ApiError(400, "videos is not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, videos, "all video is fetched successfully"))
  } catch (error) {
     res.status(500).json({ success: false, message: error.message });
  }
})
const getViewscountOfVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      throw new ApiError(400, "Video ID is missing");
    }

    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!video) {
      throw new ApiError(400, "Video not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {video:video}, "Views updated successfully"));
  } catch (error) {
    console.error("Error updating views:", error.message);

    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, null, error.message));
  }
});



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllUsersVideos,
    getViewscountOfVideo,
    
}