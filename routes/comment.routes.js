import express from "express";
import {
    getCanvasComments,
    addCommentReply, addCanvasComment,
    updateComment, deleteComment
} from "../controllers/comment.controller.js";
import bodyParser from "body-parser";

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

router.route("/canvas/:canvas_id")
    .get(getCanvasComments)
    .post(addCanvasComment);

router.route("/comment/:comment_id")
    .post(addCommentReply)
    .patch(updateComment)
    .delete(deleteComment);

export default router;
