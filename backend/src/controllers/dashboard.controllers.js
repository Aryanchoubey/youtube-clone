import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user._id
  if (!userId) {
    throw new ApiError(400 ,"user id is missing")
  }
  const user = await User.findById(userId)
    console.log( user);
   const allStatusOfChannel= await User.aggregate([
    {
        $match:{
            _id:userId
        },
        
    },{
        $lookup:{
            from:"videos",
            localField:"_id",
            foreignField:"owner",
            as:"views"
        },
       
    },
    {
        $lookup:{
            from:"videos",
            localField:"_id",
            foreignField:"owner",
            as:"allVideos"
        },
       
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
    },
    {
        $lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"likedBy",
            as:"likes"
        }
    },
    {
        $addFields:{
            totalViews:{$size :"$views"}
        },
        
    },
    {
        $addFields:{
            totalSubscribers:{$size:{$ifNull:["$subscribers",[]]}}
        }
    },
    {
        $addFields:{
            totalLikes:{$size:{ $ifNull:["$likes",[]]}}
        }
    },
    {
        $addFields:{
            totalVideos:{$size:{ $ifNull:["$allVideos",[]]}}
        }
    },
    {
        $project:{
        fullname: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        totalVideos: 1,
        totalLikes:1,
        totalSubscribers:1,
        totalViews:1,

       


        }
    }
   ],)
//    console.log( allStatusOfChannel.totalViews);
   
    if (!allStatusOfChannel.length) {
    throw new ApiError(404, "no stats found");
  }

   return res
   .status(200)
   .json(new ApiResponse(200,allStatusOfChannel[0],"all status of channel"))

});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) throw new ApiError(400, "user id is missing");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(400, "user not found");
  console.log( user);
  
//   console.log( user);
  

  const allVideos = await User.aggregate([
    {
      $match: { _id: userId }
    },

    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
        // pipeline: [
        //   {
        //     $lookup: {
        //       from: "users",
        //       localField: "owner",
        //       foreignField: "_id",
        //       as: "ownerData"
        //     }
        //   },
        //   {
        //     $addFields: {
        //       owner: { $first: "$ownerData" }   // replace array with single obj
        //     }
        //   },
        //   {
        //     $project: {
        //       ownerData: 0
        //     }
        //   }
        // ]
      }
    },

    {
      $addFields: {
        videoCount: { $size: "$videos" }
      }
    },

    {
      $project: {
        fullname: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        videoCount: 1,
        videos: 1
      }
    }
  ]);
  console.log(allVideos)

  if (!allVideos.length) {
    throw new ApiError(404, "no videos found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, allVideos[0].videos, "user all videos"));
});


export { getChannelStats, getChannelVideos };
