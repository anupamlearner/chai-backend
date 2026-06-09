import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const foundUser = await User.findById(userId);
    const accessToken = foundUser.generateAccessToken();
    const refreshToken = foundUser.generateRefreshToken();

    foundUser.refreshToken = refreshToken;
    await foundUser.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      error?.message ||
        "Something went wrong while generating refresh and access token"
    );
  }
};

// const registerUser = asyncHandler(async (req, res) => {
//   // Get  user details  from frontend
//   // Validate data, if empty, if correct format
//   // check if user already exists: username , email
//   // check for images, check for avatar
//   // upload them to cloudinary, check avatar uploaded
//   // create an user object - create entry in db
//   // remove password and refresh token field from response
//   // check for user creation
//   // return response

//   const { fullName, email, userName, password } = req.body;
//   // console.log(req.body);

//   // if (fullName === "") {
//   //   throw new ApiError(400, "fullname is required");
//   // }

//   if (
//     [fullName, email, userName, password].some((field) => field?.trim() === "")
//   ) {
//     throw new ApiError(400, "All fields are required");
//   }

//   const existingUser = await User.findOne({
//     $or: [{ userName }, { email }],
//   });

//   if (existingUser) {
//     throw new ApiError(409, "User with email or username already exists");
//   }

//   console.log(req.files);

//   const getFilePath = (files, fieldName) => {
//     if (!files || !Array.isArray(files[fieldName])) return null;
//     return files?.[fieldName]?.[0]?.path || null;
//   };

//   const avatarLocalPath = getFilePath(req.files, "avatar");
//   const coverImageLocalPath = getFilePath(req.files, "coverImage");

//   // const avatarLocalPath = req.files?.avatar?.[0]?.path;
//   // const coverImageLocalPath = req.files?.coverImage[0]?.path;
//   // let coverImageLocalPath;
//   // if (
//   //   req.files &&
//   //   Array.isArray(req.files.coverImage) &&
//   //   req.files.coverImage.length > 0
//   // ) {
//   //   coverImageLocalPath = req.files.coverImage[0].path;
//   // }

//   if (!avatarLocalPath) {
//     throw new ApiError(400, "Avatar file is required");
//   }

//   const avatar = await uploadOnCloudinary(avatarLocalPath);
//   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

//   if (!avatar) {
//     throw new ApiError(400, "Avatar file is required");
//   }
//   const userPending = await User.create({
//     fullName,
//     avatar: avatar.url,
//     coverImage: coverImage?.url || "",
//     email,
//     password,
//     userName: userName.toLowerCase(),
//   });

//   const createdUser = await User.findById(userPending._id).select(
//     "-password -refreshToken"
//   );
//   if (!createdUser) {
//     throw new ApiError(500, "Something went wrong while registering the user");
//   }

//   return res
//     .status(201)
//     .json(new ApiResponse(201, createdUser, "User registered successfully"));
// });

const registerUser = asyncHandler(async (req, res) => {
  // ALGORITHM
  // (1) Get user details from frontend
  // (2) Validate data
  // (3) Check if user already exists (username/email)
  // (4) Get avatar and cover image file paths
  // (5) Upload files to Cloudinary
  // (6) Create user document in database
  // (7) Remove sensitive fields from response
  // (8) Verify user creation
  // (9) Return success response
  // ------------

  // (1) Get user details from frontend
  const { fullName, email, userName, password } = req.body;

  // (2) Validate data
  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // (3) Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // console.log(req.files);

  // (4) Get avatar and cover image file paths
  // (4) Helper function to safely get uploaded file path
  const getFilePath = (files, fieldName) => {
    if (!files || !Array.isArray(files[fieldName])) return null;
    return files?.[fieldName]?.[0]?.path || null;
  };

  // (4.1) Get avatar file path
  const avatarLocalPath = getFilePath(req.files, "avatar");

  // (4.2) Get cover image file path (optional)
  const coverImageLocalPath = getFilePath(req.files, "coverImage");

  // (4.3) Avatar is required
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // (5) Upload files to Cloudinary
  // (5) Upload avatar and cover image to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // (5.1) Make sure avatar upload succeeded
  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // (6) Create user document in database
  const userPending = await User.create({
    fullName,

    // (6.1) Save avatar URL and Cloudinary publicId
    avatar: {
      url: avatar.secure_url,
      publicId: avatar.public_id,
    },

    // (6.2) Save cover image URL and publicId
    // If no cover image was uploaded, save empty strings
    coverImage: {
      url: coverImage?.secure_url || "",
      publicId: coverImage?.public_id || "",
    },

    email,
    password,
    userName: userName.toLowerCase(),
  });

  // (7) Remove sensitive fields from response
  const createdUser = await User.findById(userPending._id).select(
    "-password -refreshToken"
  );

  // (8) Verify user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // (9) Return success response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // take input from user (req.body)
  // validate the username/email and password
  // does user exist
  // check password with hashed password
  // if user not already logged in
  // does user have refresh token
  // send access token
  // send refresh token
  const { email, userName, password } = req.body;
  if (!(userName || email))
    throw new ApiError(400, "username or email is required");

  const foundUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!foundUser) {
    throw new ApiError("404", "User does not exist");
  }

  const isPasswordValid = await foundUser.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError("401", "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    foundUser._id
  );

  const loggedInUser = await User.findById(foundUser._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const renewAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookieOptions("accessToken", accessToken, cookieOptions)
      .cookieOptions("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(200, {
          accessToken,
          refreshToken: newRefreshToken,
          message: "Access token refreshed",
        })
      );
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confPassword } = req.body;
  if (newPassword !== confPassword) {
    throw new ApiError(400, "Confirm password does not match");
  }
  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!(fullName || email)) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { returnDocument: "after" } // instead of new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

// const updateUserAvatar = asyncHandler(async (req, res) => {
//   /*
// 1. Check if the user uploaded a file.
// 2. Get the current user from the database so we know the old avatar URL.
// 3. Upload the new avatar to Cloudinary.
// 4. If the upload fails, stop immediately and return an error.
// 5. Update the user's avatar URL in the database with the new Cloudinary URL.
// 6. If the database update fails, delete the newly uploaded image from Cloudinary (cleanup) and return an error.
// 7. Once the upload and database update are both successful, delete the old avatar from Cloudinary.
// 8. If deleting the old avatar fails, only log the error because the user's avatar has already been updated successfully.
// 9. Return the updated user.
// */

//   // 1. Validate uploaded file
//   const avatarLocalPath = req.file?.path;

//   if (!avatarLocalPath) {
//     throw new ApiError(400, "Avatar file is missing");
//   }

//   // 2. Get existing user so we can access the old avatar later
//   const existingUser = await User.findById(req.user?._id);

//   if (!existingUser) {
//     throw new ApiError(404, "User not found");
//   }

//   // 3. Upload new avatar to Cloudinary
//   const avatar = await uploadOnCloudinary(avatarLocalPath);

//   // 4. Stop if upload failed
//   if (!avatar?.url) {
//     throw new ApiError(400, "Error while uploading avatar");
//   }

//   // 5. Update user document with new avatar URL
//   const user = await User.findByIdAndUpdate(
//     req.user?._id,
//     {
//       $set: {
//         avatar: avatar.url,
//       },
//     },
//     {
//       new: true,
//     }
//   ).select("-password -refreshToken");

//   // 6. If DB update fails, remove the newly uploaded image
//   //    so Cloudinary doesn't contain unused files.
//   if (!user) {
//     await deleteFromCloudinary(avatar.url);

//     throw new ApiError(404, "Failed to update user avatar");
//   }

//   // 7. Upload + DB update succeeded.
//   //    Now it's safe to delete the old avatar.
//   if (existingUser.avatar) {
//     try {
//       await deleteFromCloudinary(existingUser.avatar);
//     } catch (error) {
//       // 8. Don't throw here.
//       //    User already has the new avatar.
//       //    At worst, an unused image remains in Cloudinary.
//       console.error(
//         "Failed to delete old avatar from Cloudinary:",
//         error.message
//       );
//     }
//   }

//   // 9. Return updated user
//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "User avatar updated successfully"));
// });

const updateUserAvatar = asyncHandler(async (req, res) => {
  /*
  ALGORITHM
  (1) Validate uploaded file
  (2) Get current user (to access old avatar publicId)
  (3) Upload new avatar to Cloudinary
  (4) If upload fails → stop
  (5) Update user in DB with new avatar (url + publicId)
  (6) If DB update fails → delete newly uploaded image
  (7) Delete old avatar from Cloudinary (cleanup)
  (8) Ignore delete failure (non-critical)
  (9) Return updated user
  */

  // (1) Validate uploaded file
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // (2) Get existing user (to access old avatar publicId)
  const existingUser = await User.findById(req.user?._id);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const oldAvatarPublicId = existingUser.avatar?.publicId;

  // (3) Upload new avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // (4) Stop if upload failed
  if (!avatar?.secure_url || !avatar?.public_id) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  // (5) Update user with new avatar (schema-compliant)
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: {
          url: avatar.secure_url,
          publicId: avatar.public_id,
        },
      },
    },
    { returnDocument: "after" } // instead of new: true
  ).select("-password -refreshToken");

  // (6) If DB update fails → delete newly uploaded image
  if (!user) {
    await deleteFromCloudinary(avatar?.public_id);
    throw new ApiError(404, "Failed to update user avatar");
  }

  // (7) Delete old avatar from Cloudinary (cleanup)
  if (oldAvatarPublicId) {
    try {
      await deleteFromCloudinary(oldAvatarPublicId);
    } catch (error) {
      // (8) Non-critical failure → just log it
      console.error(
        "Failed to delete old avatar from Cloudinary:",
        error.message
      );
    }
  }

  // (9) Return updated user
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User avatar updated successfully"));
});

// const updateUserCoverImage = asyncHandler(async (req, res) => {
//   const coverImageLocalPath = req.file?.path;
//   if (!coverImageLocalPath) {
//     new ApiError(400, "Cover image file is missing");
//   }
//   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
//   if (!coverImage.url) {
//     throw new ApiError(400, "Error while uploading on cover image");
//   }
//   const user = await User.findByIdAndUpdate(
//     req.user?._id,
//     {
//       $set: {
//         coverImage: coverImage.url,
//       },
//     },
//     { new: true }
//   ).select("-password -refreshToken");
//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "User cover image updated successfully"));
// });

const updateUserCoverImage = asyncHandler(async (req, res) => {
  /*
  ALGORITHM
  (1) Validate uploaded file
  (2) Get current user from DB (to access old coverImage publicId)
  (3) Upload new cover image to Cloudinary
  (4) If upload fails → stop
  (5) Update user with new cover image (url + publicId)
  (6) If DB update fails → delete newly uploaded image
  (7) Delete old cover image from Cloudinary
  (8) Ignore delete failure (non-critical)
  (9) Return updated user
  */

  // (1) Validate uploaded file
  const coverImageLocalPath = req.file?.path;
  // console.log("FILE:", req.file);

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  // (2) Get existing user (to get old coverImage publicId)
  const existingUser = await User.findById(req.user?._id);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const oldCoverImagePublicId = existingUser.coverImage?.publicId;

  // (3) Upload new cover image to Cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // (4) Validate upload
  if (!coverImage?.secure_url || !coverImage?.public_id) {
    throw new ApiError(400, "Error while uploading cover image");
  }

  // (5) Update user with new cover image (schema-compliant)
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: {
          url: coverImage.secure_url,
          publicId: coverImage.public_id,
        },
      },
    },
    { returnDocument: "after" } // instead of new: true
  ).select("-password -refreshToken");

  // (6) If DB update fails → delete newly uploaded image
  if (!user) {
    await deleteFromCloudinary(coverImage?.public_id);
    throw new ApiError(404, "Failed to update cover image");
  }

  // (7) Delete old cover image from Cloudinary
  if (oldCoverImagePublicId) {
    try {
      await deleteFromCloudinary(oldCoverImagePublicId);
    } catch (error) {
      console.error(
        "Failed to delete old cover image from Cloudinary:",
        error.message
      );
    }
  }

  // (9) Return updated user
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { foundUser } = req.params;
  if (!foundUser?.trim()) {
    throw new ApiError(400, "Username is missing");
  }
  const channel = await User.aggregate([
    {
      // NOTE:
      // $match: {
      //   actualNameInModel: localScopedVariable.toLowerCase(),
      // },
      $match: {
        userName: foundUser?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions", // collection to join with
        localField: "_id", // field in the current User document
        foreignField: "channel", // field in Subscription documents
        as: "subscribers", // name of the resulting array
      },
    },
    {
      $lookup: {
        from: "subscriptions", // collection to join with
        localField: "_id", // field in the current User document
        foreignField: "subscriber", // field in Subscription documents
        as: "subscribedTo", // name of the resulting Array
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers", // count documents inside the "subscribers" Array
        },

        channelsSubscribedToCount: {
          $size: "$subscribedTo", // count documents inside "subscribedTo" Array
        },

        isSubscribed: {
          $cond: {
            if: {
              $in: [
                req.user?._id, // current logged-in user's id
                // 1. MongoDB looks at every object inside the array called "subscribers"
                // 1.a "subscribers Array" created in the lookup pipeline at above stage
                // 2. then it extracts only the subscriber field from each Object.
                // 3. Create a new array from those extracted values.
                // "$arrayName.fieldName"
                // From every object in arrayName, give me the value of fieldName.
                "$subscribers.subscriber", // new array
              ],
            },
            then: true, // user is a subscriber
            else: false, // user is not a subscriber
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscriberCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  console.log(channel);
  if (!channel?.length) {
    throw new ApiError(400, "Channel does not exist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const foundUser = await User.aggregate([
    {
      $match: {
        id: new mongoose.Types.ObjectId(req.foundUser._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
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
        foundUser[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  renewAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
