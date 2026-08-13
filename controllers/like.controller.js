import { db } from "../config/db.js"
import pgFormat from "pg-format";
import { like_table_name } from "../models/likes.model.js";
import { apiError } from "../utilities/apiError.js";
import { apiResponse } from "../utilities/apiResponse.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { comment_table_name } from "../models/comments.model.js";
import { user_table_name } from "../models/user.model.js";

const getLikedContent = asyncHandler(async (req, res) => {
    const { canvas_id } = req.params;
    let canvasLike, commentsLike;
    try {
        canvasLike = await db.query(pgFormat("SELECT likedToCanvas_id AS canvas_id FROM %I WHERE likedby_id=$1 AND likedToCanvas_id=$2 ", like_table_name), [req.user.id, canvas_id]);
    } catch (e) {
        throw new apiError(400, "Error fetching canvas like.");
    }
    try {
        commentsLike = await db.query(pgFormat(`SELECT c.id AS comment_id FROM %I c 
            JOIN %I l 
            ON l.likedToComment_id = c.id
            JOIN %I u
            ON c.commentedby_id = u.id
            WHERE l.likedby_id = $1
            AND c.commentedoncanvas_id = $2;
            `, comment_table_name, like_table_name, user_table_name), [req.user.id, canvas_id]);
    } catch (e) {
        throw new apiError(400, "Error fetching comments like.");
    }
    res.status(200).json(new apiResponse(200, { canvas: canvasLike.rows[0], comments: commentsLike.rows }, "Likes Successfully fetched!"));
});

const toggleCanvasLike = asyncHandler(async (req, res) => {
    const { canvas_id } = req.params;
    const user_id = req.user.id;
    try {
        const likeStat = await db.query(pgFormat("SELECT id FROM %I WHERE likedToCanvas_id=$1 AND likedby_id=$2", like_table_name), [canvas_id, user_id]);
        if (likeStat.rows.length > 0) {
            try {
                const unLikeCanvas = await db.query(pgFormat("DELETE FROM %I WHERE likedToCanvas_id=$1 AND likedby_id=$2", like_table_name), [canvas_id, user_id]);
                res.status(200).json(new apiResponse(200, { "followStatus": false }, "Canvas un-liked successfully."));
            } catch (e) {
                throw new apiError(400, "Error un-liking canvas");
            }
        } else {
            try {
                const likeCanvas = await db.query(pgFormat("INSERT INTO %I (likedby_id,likedToCanvas_id) VALUES ($1,$2)", like_table_name), [user_id, canvas_id]);
                res.status(200).json(new apiResponse(200, { "followStatus": true }, "Canvas liked successfully."));
            } catch (e) {
                throw new apiError(400, "Error liking canvas");
            }
        }
    } catch (e) {
        throw new apiError(400, "Error toggling canvas like.");
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { comment_id } = req.params;
    const user_id = req.user.id;
    try {

        const likeStat = await db.query(pgFormat("SELECT id FROM %I WHERE likedToComment_id=$1 AND likedby_id=$2", like_table_name), [comment_id, user_id]);
        if (likeStat.rows.length > 0) {
            try {
                const unLikeComment = await db.query(pgFormat("DELETE FROM %I WHERE likedToComment_id=$1 AND likedby_id=$2", like_table_name), [comment_id, user_id]);
                res.status(200).json(new apiResponse(200, { "followStatus": false }, "Comment un-liked successfully."));
            } catch (e) {
                throw new apiError(400, "Error un-liking comment");
            }
        } else {
            try {
                const likeComment = await db.query(pgFormat("INSERT INTO %I (likedby_id,likedToComment_id) VALUES ($1,$2)", like_table_name), [user_id, comment_id]);
                res.status(200).json(new apiResponse(200, { "followStatus": true }, "Comment liked successfully."));
            } catch (e) {
                throw new apiError(400, "Error liking comment");
            }
        }
    } catch (e) {
        throw new apiError(400, "Error toggling comment like.");
    }
});

export { toggleCanvasLike, toggleCommentLike, getLikedContent };
