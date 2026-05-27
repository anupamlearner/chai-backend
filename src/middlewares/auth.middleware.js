import { User } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization") || req.headers.authorization;
    const token =
      req.cookies?.accessToken ||
      (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);
    if (!token) {
      throw new ApiError(401, "Unauthorized token");
    }
    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    const foundUser = await User.findById(decodedToken?._id).select(
      "-password",
      "-refreshToken"
    );
    if (!foundUser) {
      // NOTE: discuss about front end in next video
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = foundUser;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
