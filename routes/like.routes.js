import express from "express";
import bodyParser from "body-parser";
import { getLikedContent, toggleCanvasLike, toggleCommentLike } from "../controllers/like.controller.js";

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

router.route("/liked/content/:canvas_id").get(getLikedContent);
router.route("/toggle/canvas/:canvas_id").post(toggleCanvasLike);
router.route("/toggle/comment/:comment_id").post(toggleCommentLike);

export default router;