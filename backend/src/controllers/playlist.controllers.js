import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"


const createPlaylist = asyncHandler(async (req, res) => {
    // console.log( req.body);
    
    const {name, description} = req.body
   
    
    

    if (!(name || description) ) {
        throw new ApiError(400, "this is required field")
    }
    const playlist = await Playlist.create({
        name,
        description,
        // video:new mongoose.Types.ObjectId(vi),
        creater :new mongoose.Types.ObjectId(req.user._id)
    })
    if (!playlist) {
        throw new ApiError(400,"playlist is missing")
    }
    console.log( playlist.creater);
    
    
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"playlist is created successfully"))

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "playlistId is missing");
    }

    const playlist = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"playlists",
                localField:"_id",
                foreignField:"creater",
                as:"allPlaylist"
            }
        },
        {
            $addFields:{
                playlistCount:{
                    $size:{$ifNull:["$allPlaylist",[]]}
                }
            }
        },
        {
            $project:{
               
                playlistCount: 1,
                allPlaylist: 1
            }
        }
    ])
        

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});



const getPlaylistById = asyncHandler(async (req, res) => {
     const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "playlistId is missing");
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("creater", "username fullname avatar")
        .lean();

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!(playlistId && videoId)) {
        throw new ApiError(400, "playlistId and videoId is missing")
    }
    const playlist = await Playlist.findByIdAndUpdate(playlistId
        ,{
            videos:videoId
        },
        {
            new :true
        }
    )
    if (!playlist) {
        throw new ApiError(400 ,"video is not added in playlist")
    }
     return res
     .status(200)
     .json(new ApiResponse(200, playlist ,"video is successfully added"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!(playlistId && videoId)) {
        throw new ApiError(400,"playlistId and videoId is missing")
    }
    // console.log(playlistId,videoId)
    const DeleteVideoFromPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }
        },
        {
            new:true
        }
    )

    if (!DeleteVideoFromPlaylist) {
        throw new ApiError(400,"video is not dleted from playlist")
    }
    // console.log( DeleteVideoFromPlaylist);
    
    return res
    .status(200)
    .json(new ApiResponse (200,DeleteVideoFromPlaylist,"video is deleted" ))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    console.log( req.params);
    

    // TODO: delete playlist
    if (!playlistId) {
        throw new ApiError(400, "playlistId is missing")
    }
    const deletePlaylist = await Playlist.findByIdAndDelete(playlistId)
    console.log( deletePlaylist);
    
    if (!deletePlaylist) {
        throw new ApiError(400, "playlist is not deleted")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,"playlist is deleted succesfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!playlistId) {
        throw new ApiError(400, "playlistId is missing")
    }
    if (!(playlistId || description)) {
        throw new ApiError(400, "field are required")
    }
    const updatePlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            name :name,
            description:description
        },
        {
            new:true
        }
    )
    if (!updatePlaylist) {
        throw new ApiError(400, "playlist is not updated")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, updatePlaylist ,"playlist is not updated "))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}