import { asyncHandler } from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";

import { User } from "../models/user.models.js";

import {
  uploadOnCloudinaryVideo,
  uploadOnCloudinaryImage,
} from "../utils/cloudinary.js";

import { ApiResponse } from "../utils/ApiResponse.js";

import jwt from "jsonwebtoken";

import mongoose from "mongoose";

import { OAuth2Client } from "google-auth-library";


// Google OAuth client
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);


// =====================================================
// GENERATE ACCESS + REFRESH TOKEN
// =====================================================

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating tokens"
    );
  }
};


// =====================================================
// REGISTER USER
// =====================================================

const registerUser = asyncHandler(async (req, res) => {

  const {
    fullname,
    email,
    password,
    username,
  } = req.body;


  // Basic validation
  if (
    [fullname, email, username, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(
      400,
      "All fields are required"
    );
  }


  // Check existing user
  const existedUser = await User.findOne({
    $or: [
      {
        email: email.toLowerCase(),
      },
      {
        username: username.toLowerCase(),
      },
    ],
  });


  if (existedUser) {
    throw new ApiError(
      409,
      "User already exists"
    );
  }


  // Uploaded files
  const avatarLocalPath =
    req.files?.avatar?.[0]?.path;

  const coverImagePath =
    req.files?.coverImage?.[0]?.path || null;


  let avatar = "";

  let coverImage = "";


  // Avatar
  if (avatarLocalPath) {

    const upload =
      await uploadOnCloudinaryImage(
        avatarLocalPath
      );

    avatar =
      upload?.secure_url || "";
  }


  // Cover image
  if (coverImagePath) {

    const upload =
      await uploadOnCloudinaryImage(
        coverImagePath
      );

    coverImage =
      upload?.secure_url || "";
  }


  // Create user
  const user = await User.create({

    fullname,

    email: email.toLowerCase(),

    password,

    username: username.toLowerCase(),

    avatar,

    coverImage,
  });


  const createdUser =
    await User.findById(user._id)
      .select("-password -refreshToken");


  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while creating user"
    );
  }


  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        createdUser,
        "User registered successfully"
      )
    );
});


// =====================================================
// GOOGLE LOGIN / REGISTER
// =====================================================

const googleLogin = asyncHandler(async (req, res) => {

  const {
    credential,
  } = req.body;


  if (!credential) {

    throw new ApiError(
      400,
      "Google credential is required"
    );
  }


  // -----------------------------------------------
  // VERIFY GOOGLE TOKEN
  // -----------------------------------------------

  let ticket;

  try {

    ticket =
      await client.verifyIdToken({

        idToken: credential,

        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

  } catch (error) {

    console.error(
      "Google token verification error:",
      error
    );

    throw new ApiError(
      401,
      "Invalid Google credential"
    );
  }


  // -----------------------------------------------
  // GOOGLE USER DATA
  // -----------------------------------------------

  const payload =
    ticket.getPayload();


  const {
    sub: googleId,
    email,
    name,
    picture,
    email_verified,
  } = payload;


  if (!email) {

    throw new ApiError(
      400,
      "Google email not found"
    );
  }


  if (!email_verified) {

    throw new ApiError(
      400,
      "Google email is not verified"
    );
  }


  // -----------------------------------------------
  // FIND USER BY GOOGLE ID
  // -----------------------------------------------

  let user =
    await User.findOne({
      googleId,
    });


  // -----------------------------------------------
  // FIND USER BY EMAIL
  // -----------------------------------------------

  if (!user) {

    user =
      await User.findOne({
        email: email.toLowerCase(),
      });
  }


  // -----------------------------------------------
  // EXISTING USER
  // -----------------------------------------------

  if (user) {

    // Link Google account
    if (!user.googleId) {

      user.googleId =
        googleId;
    }


    // Add Google profile image
    if (!user.avatar && picture) {

      user.avatar =
        picture;
    }


    await user.save({
      validateBeforeSave: false,
    });
  }


  // -----------------------------------------------
  // NEW GOOGLE USER
  // -----------------------------------------------

  if (!user) {

    let username =
      email
        .split("@")[0]
        .replace(
          /[^a-zA-Z0-9]/g,
          ""
        )
        .toLowerCase();


    if (!username) {

      username =
        `user${Date.now()}`;
    }


    // Check username
    const usernameExists =
      await User.findOne({
        username,
      });


    if (usernameExists) {

      username =
        username +
        Date.now()
          .toString()
          .slice(-6);
    }


    // Create Google user
    user =
      await User.create({

        fullname:
          name || username,

        email:
          email.toLowerCase(),

        username,

        avatar:
          picture || "",

        googleId,

        password: null,
      });
  }


  // -----------------------------------------------
  // GENERATE JWT
  // -----------------------------------------------

  const {
    accessToken,
    refreshToken,
  } =
    await generateAccessAndRefreshToken(
      user._id
    );


  // -----------------------------------------------
  // SAFE USER
  // -----------------------------------------------

  const loggedInUser =
    await User.findById(
      user._id
    ).select(
      "-password -refreshToken"
    );


  // -----------------------------------------------
  // COOKIE OPTIONS
  // -----------------------------------------------

  const options = {

    httpOnly: true,

    secure:
      process.env.NODE_ENV === "production",

    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  };


  // -----------------------------------------------
  // RESPONSE
  // -----------------------------------------------

  return res

    .status(200)

    .cookie(
      "accessToken",
      accessToken,
      options
    )

    .cookie(
      "refreshToken",
      refreshToken,
      options
    )

    .json(

      new ApiResponse(

        200,

        {

          user:
            loggedInUser,

          username:
            user.username,

          accessToken,

          refreshToken,

          _id:
            user._id,
        },

        "Google login successful"
      )
    );
});


// =====================================================
// NORMAL LOGIN
// =====================================================

const loginUser = asyncHandler(async (req, res) => {

  const {
    email,
    password,
    username,
  } = req.body;


  if (!(username || email)) {

    throw new ApiError(
      400,
      "Email or username is required"
    );
  }


  const user =
    await User.findOne({
      $or: [
        {
          username,
        },
        {
          email,
        },
      ],
    });


  if (!user) {

    throw new ApiError(
      404,
      "User does not exist"
    );
  }


  // Google account trying password login
  if (!user.password) {

    throw new ApiError(
      400,
      "This account uses Google login"
    );
  }


  const isPasswordValid =
    await user.isPasswordCorrect(
      password
    );


  if (!isPasswordValid) {

    throw new ApiError(
      401,
      "Invalid user credentials"
    );
  }


  const {
    accessToken,
    refreshToken,
  } =
    await generateAccessAndRefreshToken(
      user._id
    );


  const loggedInUser =
    await User.findById(
      user._id
    ).select(
      "-password -refreshToken"
    );


  const options = {

    httpOnly: true,

    secure:
      process.env.NODE_ENV === "production",

    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  };


  return res

    .status(200)

    .cookie(
      "accessToken",
      accessToken,
      options
    )

    .cookie(
      "refreshToken",
      refreshToken,
      options
    )

    .json(

      new ApiResponse(

        200,

        {

          user:
            loggedInUser,

          username:
            user.username,

          accessToken,

          refreshToken,

          _id:
            user._id,
        },

        "User logged in successfully"
      )
    );
});


// =====================================================
// LOGOUT
// =====================================================

const logoutUser =
  asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(

      req.user._id,

      {
        $unset: {
          refreshToken: 1,
        },
      },

      {
        new: true,
      }
    );


    const options = {

      httpOnly: true,

      secure:
        process.env.NODE_ENV === "production",

      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
    };


    return res

      .status(200)

      .clearCookie(
        "accessToken",
        options
      )

      .clearCookie(
        "refreshToken",
        options
      )

      .json(
        new ApiResponse(
          200,
          {},
          "User logged out"
        )
      );
  });


// =====================================================
// REFRESH TOKEN
// =====================================================

const refreshAccessToken =
  asyncHandler(async (req, res) => {

    const incomingRefreshToken =
      req.cookies?.refreshToken ||
      req.body?.refreshToken;


    if (!incomingRefreshToken) {

      throw new ApiError(
        401,
        "Unauthorized request"
      );
    }


    try {

      const decodedToken =
        jwt.verify(
          incomingRefreshToken,
          process.env
            .REFRESH_TOKEN_SECRET
        );


      const user =
        await User.findById(
          decodedToken._id
        );


      if (!user) {

        throw new ApiError(
          401,
          "Invalid refresh token"
        );
      }


      if (
        incomingRefreshToken !==
        user.refreshToken
      ) {

        throw new ApiError(
          401,
          "Refresh token is expired"
        );
      }


      const {
        accessToken,
        refreshToken,
      } =
        await generateAccessAndRefreshToken(
          user._id
        );


      return res

        .status(200)

        .json(

          new ApiResponse(

            200,

            {
              accessToken,
              refreshToken,
            },

            "Access token refreshed"
          )
        );

    } catch (error) {

      throw new ApiError(
        401,
        error?.message ||
          "Invalid refresh token"
      );
    }
  });


// =====================================================
// CHANGE PASSWORD
// =====================================================

const changeCurrentPassword =
  asyncHandler(async (req, res) => {

    const {
      oldPassword,
      newPassword,
      confirmPassword,
    } = req.body;


    const user =
      await User.findById(
        req.user?._id
      );


    if (!user) {

      throw new ApiError(
        404,
        "User not found"
      );
    }


    if (!user.password) {

      throw new ApiError(
        400,
        "Google accounts do not have a password"
      );
    }


    const isPasswordCorrect =
      await user.isPasswordCorrect(
        oldPassword
      );


    if (!isPasswordCorrect) {

      throw new ApiError(
        400,
        "Invalid password"
      );
    }


    if (
      newPassword !==
      confirmPassword
    ) {

      throw new ApiError(
        400,
        "Password does not match"
      );
    }


    user.password =
      newPassword;


    await user.save();


    return res

      .status(200)

      .json(

        new ApiResponse(
          200,
          {},
          "Password changed successfully"
        )
      );
  });


// =====================================================
// CURRENT USER
// =====================================================

const getCurrentUser =
  asyncHandler(async (req, res) => {

    return res

      .status(200)

      .json(

        new ApiResponse(
          200,
          req.user,
          "Current user fetched successfully"
        )
      );
  });


// =====================================================
// UPDATE ACCOUNT
// =====================================================

const updateAccountDetail =
  asyncHandler(async (req, res) => {

    const {
      fullname,
      email,
    } = req.body;


    if (!(fullname || email)) {

      throw new ApiError(
        400,
        "All fields are required"
      );
    }


    const user =
      await User.findByIdAndUpdate(

        req.user?._id,

        {
          $set: {
            fullname,
            email,
          },
        },

        {
          new: true,
        }
      ).select("-password");


    return res

      .status(200)

      .json(

        new ApiResponse(
          200,
          user,
          "Account details updated successfully"
        )
      );
  });


// =====================================================
// UPDATE AVATAR
// =====================================================

const updateUserAvatar =
  asyncHandler(async (req, res) => {

    const avatarLocalPath =
      req.file?.path;


    if (!avatarLocalPath) {

      throw new ApiError(
        400,
        "Avatar file is missing"
      );
    }


    const upload =
      await uploadOnCloudinaryImage(
        avatarLocalPath
      );


    if (!upload?.secure_url) {

      throw new ApiError(
        500,
        "Avatar upload failed"
      );
    }


    const user =
      await User.findByIdAndUpdate(

        req.user._id,

        {
          $set: {
            avatar:
              upload.secure_url,
          },
        },

        {
          new: true,
        }
      ).select("-password");


    return res

      .status(200)

      .json(

        new ApiResponse(
          200,
          user,
          "Avatar updated successfully"
        )
      );
  });


// =====================================================
// UPDATE COVER IMAGE
// =====================================================

const updateUserCoverImage =
  asyncHandler(async (req, res) => {

    const coverImageLocalPath =
      req.file?.path;


    if (!coverImageLocalPath) {

      throw new ApiError(
        400,
        "Cover image file is missing"
      );
    }


    const upload =
      await uploadOnCloudinaryImage(
        coverImageLocalPath
      );


    if (!upload?.secure_url) {

      throw new ApiError(
        500,
        "Cover image upload failed"
      );
    }


    const user =
      await User.findByIdAndUpdate(

        req.user._id,

        {
          $set: {
            coverImage:
              upload.secure_url,
          },
        },

        {
          new: true,
        }
      ).select("-password");


    return res

      .status(200)

      .json(

        new ApiResponse(
          200,
          user,
          "Cover image updated successfully"
        )
      );
  });


// =====================================================
// CHANNEL PROFILE
// =====================================================

const getUserChannelProfile =
  asyncHandler(async (req, res) => {

    const {
      userId,
    } = req.params;


    if (!userId) {

      throw new ApiError(
        400,
        "User ID is missing"
      );
    }


    const channel =
      await User.aggregate([

        {
          $match: {
            _id:
              new mongoose.Types.ObjectId(
                userId
              ),
          },
        },


        {
          $lookup: {

            from:
              "subscriptions",

            localField:
              "_id",

            foreignField:
              "channel",

            as:
              "subscribers",
          },
        },


        {
          $lookup: {

            from:
              "subscriptions",

            localField:
              "_id",

            foreignField:
              "subscriber",

            as:
              "subscribedTo",
          },
        },


        {
          $lookup: {

            from:
              "subscriptions",

            localField:
              "_id",

            foreignField:
              "likedBy",

            as:
              "allVideosIsLiked",
          },
        },


        {
          $addFields: {

            subscriberCount: {

              $size: {
                $ifNull: [
                  "$subscribers",
                  [],
                ],
              },
            },


            channelSubscriberToCount: {

              $size: {
                $ifNull: [
                  "$subscribedTo",
                  [],
                ],
              },
            },


            totalVideosCountisLiked: {

              $size: {
                $ifNull: [
                  "$allVideosIsLiked",
                  [],
                ],
              },
            },


            isSubscribed: {

              $cond: {

                if: {

                  $in: [

                    req.user?._id,

                    {
                      $ifNull: [
                        "$subscribers.subscriber",
                        [],
                      ],
                    },
                  ],
                },

                then: true,

                else: false,
              },
            },
          },
        },


        {
          $project: {

            fullname: 1,

            username: 1,

            subscriberCount: 1,

            channelSubscriberToCount: 1,

            totalVideosCountisLiked: 1,

            isSubscribed: 1,

            avatar: 1,

            coverImage: 1,
          },
        },

      ]);


    if (!channel.length) {

      throw new ApiError(
        404,
        "Channel does not exist"
      );
    }


    return res

      .status(200)

      .json(

        new ApiResponse(
          200,
          channel[0],
          "User channel fetched successfully"
        )
      );
  });


// =====================================================
// WATCH HISTORY
// =====================================================

const addToWatchHistory =
  asyncHandler(async (req, res) => {

    const {
      videoId,
    } = req.params;


    if (!videoId) {

      throw new ApiError(
        400,
        "Video ID is required"
      );
    }


    await User.findByIdAndUpdate(

      req.user._id,

      {
        $pull: {
          watchHistory:
            videoId,
        },
      }
    );


    await User.findByIdAndUpdate(

      req.user._id,

      {
        $push: {

          watchHistory: {

            $each: [
              videoId,
            ],

            $position: 0,
          },
        },
      }
    );


    return res

      .status(200)

      .json(

        new ApiResponse(
          200,
          null,
          "Added to watch history"
        )
      );
  });


// =====================================================
// GET WATCH HISTORY
// =====================================================

const getWatchHistory =
  asyncHandler(async (req, res) => {

    const user =
      await User.aggregate([

        {
          $match: {

            _id:
              new mongoose.Types.ObjectId(
                req.user._id
              ),
          },
        },


        {
          $lookup: {

            from:
              "videos",

            localField:
              "watchHistory",

            foreignField:
              "_id",

            as:
              "watchHistory",

            pipeline: [

              {
                $lookup: {

                  from:
                    "users",

                  localField:
                    "owner",

                  foreignField:
                    "_id",

                  as:
                    "owner",

                  pipeline: [

                    {

                      $project: {

                        fullname: 1,

                        username: 1,

                        avatar: 1,
                      },
                    },
                  ],
                },
              },


              {

                $addFields: {

                  owner: {
                    $first:
                      "$owner",
                  },
                },
              },
            ],
          },
        },
      ]);


    return res

      .status(200)

      .json(

        new ApiResponse(

          200,

          user[0]?.watchHistory || [],

          "Watch history fetched successfully"
        )
      );
  });


export {
  registerUser,
  loginUser,
  googleLogin,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetail,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  addToWatchHistory,
  getWatchHistory,
};