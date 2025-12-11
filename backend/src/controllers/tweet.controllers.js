import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    const userId = req.user._id
    if (!content) {
        throw new ApiError(400, "this feild is required")
    }
    if (!userId) {
        throw new ApiError(400, "userId is missing")
    }
     const tweet = await Tweet.create({
      content,
      owner:userId
     })
     if (!tweet) {
        throw new ApiError(400, "tweet is not created ")
     }
   return res
   .status(200)
   .json(new ApiResponse(400, tweet ,"tweet create successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
   if (!userId) {
    throw new ApiError(400, "userId is missing")
   }
   const tweet= await User.aggregate([
    {
        $match:{
            _id:new mongoose.Types.ObjectId(userId)
        }
    },
    {
        $lookup:{
            from:"tweets",
            localField:"_id",
            foreignField:"owner",
            as:"allTweet"
        }
    },{
        $addFields:{
            tweetCount:{
                $size:{$ifNull:["$allTweet",[]]}
            }
        }
    },{
        $project:{
            tweetCount:1,
            allTweet:1
        }
    }
   ])
   if (!tweet) {
    throw new ApiError(400, "something went wrong")
   }
   return res
   .status(200)
   .json(new ApiResponse(200,tweet,"all tweet is fetched successfully"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content}= req.body
    if (!tweetId) {
        throw new ApiError(400, "tweetId is missing")
    }
    const updateTweet= await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:{
                content:content
            }
        },
        {
            new:true
        }
    )
    if (!updateTweet) {
        throw new ApiError(400, "tweet is not updated")
    }
    return  res
    .status(200)
    .json(new ApiResponse(200, updateTweet, "tweet is update  successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if (!tweetId) {
        throw new ApiError(400, "tweetId is missing")
    }
    const deleteTweet= await Tweet.findByIdAndDelete(tweetId)
    if (!deleteTweet) {
        throw new ApiError(400, "tweet is not deleted")
    }
    return res
    .status(200)
    .json(new ApiResponse (200, {},"tweet is deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}