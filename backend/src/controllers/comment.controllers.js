import mongoose from "mongoose"
import {Comments} from "../models/comments.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const pipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $facet: {
                metadata: [
                    { $count: "totalComments" },
                    { $addFields: { page, limit } }
                ],
                comments: [
                    // { $skip: skip },
                    // { $limit: limit },
                    // {
                    //     $lookup: {
                    //         from: "users",
                    //         localField: "owner",
                    //         foreignField: "_id",
                    //         as: "user"
                    //     }
                    // },
                    // {
                    //     $unwind: {
                    //         path: "$user",
                    //         preserveNullAndEmptyArrays: true   // 🔥 THIS IS THE FIX
                    //     }
                    // }
                ]
            }
        }
    ];

    const result = await Comments.aggregate(pipeline);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Comments fetched successfully"));
});



const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body
    const {videoId} = req.params
    
    if (!content) {
        throw new ApiError(400,"content is missing")
    }
    if (!videoId) {
        throw new ApiError(400, "video id is missing")
    }
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(400,"the user id is missing")
    }
    const comment = await Comments.create(
        {
   content :content.trim(),
   video:videoId,
   user:userId

        }
    )

    if (!comment) {
        throw new ApiError(400,"comment is not created")
    }
    return res
    .status(200)
    .json(new ApiResponse (200, comment ,"comment is created successfully"))
    

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    console.log( req.params);
    console.log( req.body);
    
    const{commentId}=req.params
    const{content} =req.body
    if (!content) {
        throw new ApiError(400, "content is missing")
    }
    if (!commentId) {
        throw new ApiError(400,"comment id is missing")
    }
    const comment = await Comments.findByIdAndUpdate(commentId,
        {
            $set:{
                content:content
            }
        },{
            new:true
        }
    )
    if (!comment) {
        throw new ApiError(400,"comment is not updated ")
    }
    console.log( comment);
    
    return res
    .status(200)
    .json(new ApiResponse(200,comment[0],"comment are updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if (!commentId) {
        throw new ApiError(400, "commentId is missing")
    }
    const deleteComment= await Comments.findByIdAndDelete(commentId)
    if (!deleteComment) {
        throw new ApiError("comment is not delete")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, {},"comment is delete successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }