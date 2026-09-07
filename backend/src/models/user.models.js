import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    // Username
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Email
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Full Name
    fullname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // Profile Image
    avatar: {
      type: String,
    },

    // Google Account ID
    googleId: {
      type: String,
      default: null,
      index: true,
    },

    // Cover Image
    coverImage: {
      type: String,
    },

    // Watch History
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    // Password
    // Google users can have null password
    password: {
      type: String,
      default: null,
    },

    // Refresh Token
    refreshToken: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);


// ======================================================
// HASH PASSWORD BEFORE SAVE
// ======================================================

userSchema.pre("save", async function (next) {
  // Don't hash if password wasn't changed
  // OR password is null (Google user)
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);

  next();
});


// ======================================================
// CHECK PASSWORD
// ======================================================

userSchema.methods.isPasswordCorrect = async function (password) {
  // Google users don't have a password
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(password, this.password);
};


// ======================================================
// GENERATE ACCESS TOKEN
// ======================================================

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },

    process.env.ACCESS_TOKEN_SECRET,

    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};


// ======================================================
// GENERATE REFRESH TOKEN
// ======================================================

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },

    process.env.REFRESH_TOKEN_SECRET,

    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};


// ======================================================
// EXPORT USER MODEL
// ======================================================

export const User = mongoose.model("User", userSchema);