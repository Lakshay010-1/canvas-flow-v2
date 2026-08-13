import { db } from "../config/db.js"
import pgFormat from "pg-format";
import { comment_table_name } from "../models/comments.model.js";
import { apiError } from "../utilities/apiError.js"
import { apiResponse } from "../utilities/apiResponse.js"
import { asyncHandler } from "../utilities/asyncHandler.js";

const getCanvasComments = asyncHandler(async (req, res) => {
    const { canvas_id } = req.params;
    const query = `WITH RECURSIVE comment_tree AS (
                SELECT * FROM ${pgFormat.ident(comment_table_name)} 
                WHERE commentedoncanvas_id = $1
                UNION ALL
                SELECT c.*
                FROM ${pgFormat.ident(comment_table_name)} c
                INNER JOIN comment_tree ct ON c.commentedoncomment_id = ct.id
                )
                SELECT * FROM comment_tree ORDER BY createdat ASC`;
    try {
        const comments = await db.query(query, [canvas_id]);
        res.status(201).json(new apiResponse(200, { comments: comments.rows }, "Comments fetched successfully."));
    } catch (e) {
        throw new apiError(400, `Error fetching Comment(s), ${e}`);
    }
});
const addCommentReply = asyncHandler(async (req, res) => {
    const { comment_id } = req.params;
    const user_id = req.user.id;
    const { comment } = req.body;
    const createdAtDate = new Date();
    try {
        const postComment = await db.query(pgFormat("INSERT INTO %I (commentedby_id,comment,commentedoncomment_id,createdAt) VALUES ($1,$2,$3,$4) RETURNING *", comment_table_name), [user_id, comment, comment_id, createdAtDate]);
        res.status(201).json(new apiResponse(201, { affected: postComment.rows }, "Comment Replied successfully."));
    } catch (e) {
        throw new apiError(400, `Error replying Comment, ${e}`);
    }
});
const addCanvasComment = asyncHandler(async (req, res) => {
    const { canvas_id } = req.params;
    const user_id = req.user.id;
    const { comment } = req.body;
    const createdAtDate = new Date();
    try {
        const postComment = await db.query(pgFormat("INSERT INTO %I (commentedby_id,comment,commentedoncanvas_id,createdAt) VALUES ($1,$2,$3,$4) RETURNING *", comment_table_name), [user_id, comment, canvas_id, createdAtDate]);
        res.status(201).json(new apiResponse(201, { affected: postComment.rows }, "Commented on Canvas successfully."));
    } catch (e) {
        throw new apiError(400, `Error canvas Comment, ${e}`);
    }
});
const updateComment = asyncHandler(async (req, res) => {
    const { comment_id } = req.params;
    const user_id = req.user.id;
    const { comment } = req.body;
    const updatedAtDate = new Date();
    try {
        const updateComment = await db.query(pgFormat("UPDATE %I SET comment=$1,updatedAt=$2 WHERE id=$3 AND commentedby_id=$4 RETURNING *", comment_table_name), [comment, updatedAtDate, comment_id, user_id]);
        res.status(200).json(new apiResponse(200, { affected: updateComment.rows }, "Comment Updated successfully."));
    } catch (e) {
        throw new apiError(400, `Error updating Comment, ${e}`);
    }
});
const deleteComment = asyncHandler(async (req, res) => {
    const { comment_id } = req.params;
    try {
        const delComment = await db.query(pgFormat(`WITH RECURSIVE to_delete AS (
                                                        SELECT id 
                                                        FROM %I WHERE id = $1
                                                        UNION ALL
                                                        SELECT c.id
                                                        FROM %I c
                                                        INNER JOIN to_delete td ON c.commentedoncomment_id = td.id
                                                    )
                                                    DELETE FROM %I WHERE id IN (SELECT id FROM to_delete) RETURNING *;`,
            comment_table_name, comment_table_name, comment_table_name), [comment_id]);
        res.status(200).json(new apiResponse(200, { affected: delComment.rowCount }, "Comment(s) deleted successfully."));
    } catch (e) {
        throw new apiError(400, `Error deleting Comment,${e}`);
    }
});

export {
    getCanvasComments,
    addCommentReply, addCanvasComment,
    updateComment, deleteComment
};