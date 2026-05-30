import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  renewAccessToken,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// REGISTER (multipart: avatar + coverImage)
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

// LOGIN
router.route("/login").post(loginUser);

// SECURED ROUTES
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(renewAccessToken);

// UPDATE AVATAR
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

// router.patch(
//   "/avatar",
//   verifyJWT,
//   (req, res, next) => {
//     console.log("🔥 ROUTE HIT - AVATAR");
//     next();
//   },
//   upload.single("avatar"),
//   updateUserAvatar
// );

// UPDATE COVER IMAGE
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

export default router;
