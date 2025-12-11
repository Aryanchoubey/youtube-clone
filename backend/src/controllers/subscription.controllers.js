import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    console.log( channelId);
    
    const userId = req.user?._id; // logged in user

    if (!channelId) {
        throw new ApiError(400, "channelId is missing");
    }
    
         const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,
    });

    let message = "";
    let result = null;

    if (existingSubscription) {
        // Unsubscribe → delete subscription
        await Subscription.findByIdAndDelete(existingSubscription._id);
        message = "Unsubscribed successfully";
        return res
        .status(200)
        .json(new ApiResponse(200, {}, message))
    
    }
   
        // Subscribe → create subscription
        result = await Subscription.create({
            subscriber: userId,
            channel: channelId,
        });
        message = "Subscribed successfully";
    

    // Check if subscription already exists
     
 return res.status(200).json(
        new ApiResponse(200, result, message)
    );
   
});


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;  // FIXED
     
    if (!channelId) {
        throw new ApiError(400, "channelId is missing");
    }
console.log(channelId)
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        { $unwind: "$subscriberDetails" },
        {
            $project: {
                _id: 1,
                subscriber: 1,
                channel: 1,
                "subscriberDetails._id": 1,
                "subscriberDetails.username": 1,
                "subscriberDetails.fullname": 1,
                "subscriberDetails.avatar": 1
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscriber list fetched successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!channelId) {
        throw new ApiError(400, "channelId is missing")
    }
    const {userId} = req.user._id
    if (!userId) {
        throw new ApiError(400 ,"userId is missing")
    }

    
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}