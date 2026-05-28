import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization") || req.headers.authorization;
    const token =
      req.cookies?.accessToken ||
      (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

    if (!token || token === "undefined" || token === "null") {
      throw new ApiError(401, "Unauthorized token");
    }

    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const foundUser = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!foundUser) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = foundUser;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
