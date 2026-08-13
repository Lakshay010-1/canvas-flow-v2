import express from "express";
import {
    getCurrentUser, updateCurrentPassword,
    updateAccountInfo, updateProfilePic, artistTotalViews,
    artistTotalSubscribers, artistTotalCanvases,
    artistTotalLikes, artistTotalLikesCanvases, artistTotalLikesComments
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.get("/current/me", getCurrentUser);

router.get("/total/views", artistTotalViews);

router.get("/total/subs", artistTotalSubscribers);

router.get("/total/canvases", artistTotalCanvases);

router.get("/total/likes", artistTotalLikes);

router.get("/total/canvases/likes", artistTotalLikesCanvases);

router.get("/total/comments/likes", artistTotalLikesComments);

router.patch("/update/password", updateCurrentPassword);

router.patch("/update/info", updateAccountInfo);

router.patch("/update/profilepic", upload.single("profilePic"), updateProfilePic);

export default router;