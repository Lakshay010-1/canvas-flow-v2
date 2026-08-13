import { db } from "../config/db.js";
import { user_table_name } from "../models/user.model.js";
import { apiResponse } from "../utilities/apiResponse.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import pgFormat from "pg-format";
import bcrypt from "bcrypt";
import { apiError } from "../utilities/apiError.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utilities/cloudinary.util.js";
import { canvas_table_name } from "../models/canvas.model.js";
import { sub_table_name } from "../models/subscriptions.model.js";
import { like_table_name } from "../models/likes.model.js";

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new apiResponse(200, req.user, "User Fetched successfully!"));
});

const updateCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const updatedAt = new Date();
    let user = await db.query(pgFormat("SELECT * FROM %I WHERE id=$1", user_table_name), [req.user.id]);
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.rows[0].password);
    if (!isPasswordCorrect) {
        throw new apiError(400, "In-correct Password");
    }
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.SALT_ROUNDS));
    user = await db.query(pgFormat(("UPDATE %I SET password=$1,updatedAt=$2 WHERE id=$3"), user_table_name), [hashedPassword, updatedAt, user.rows[0].id]);
    return res.status(200).json(new apiResponse(200, user.rowCount, "Password Updated successfully!"));
});

const updateAccountInfo = asyncHandler(async (req, res) => {
    const { email, username } = req.body;
    const updatedAt = new Date();
    if (email) {
        await db.query(pgFormat("UPDATE %I SET email=$1,updatedAt=$2 WHERE id=$3", user_table_name), [email, updatedAt, req.user.id]);
    }
    if (username) {
        await db.query(pgFormat("UPDATE %I SET username=$1,updatedAt=$2 WHERE id=$3", user_table_name), [username, updatedAt, req.user.id]);
    }
    const user = await db.query(pgFormat("SELECT username,email,profileImage FROM %I WHERE id=$1", user_table_name), [req.user.id]);
    return res.status(200).json(new apiResponse(200, user.rowCount, `${((email) ? 'email' : '')}${(email && username) ? ' and ' : ''}${(username) ? 'username' : ''} updated successfully`));
});

const updateProfilePic = asyncHandler(async (req, res) => {
    const profilePic = req.file?.path;
    const updatedAt = new Date();

    if (!profilePic) {
        throw new apiError(404, "profile pic required!");
    }

    // old profile pic
    const oldProfileId = await db.query(pgFormat("SELECT profileImageId FROM %I WHERE id=$1", user_table_name), [req.user.id]);
    if (oldProfileId.rows[0]) {
        await deleteFromCloudinary(oldProfileId.rows[0]);
        console.log("Old profile pic deleted");
    }

    const newProfilePic = await uploadOnCloudinary(profilePic);
    if (!newProfilePic.url) {
        throw new apiError(400, "Error uploading new profile pic");
    }
    const updation = await db.query(pgFormat("UPDATE %I SET profileImage=$1,profileImageId=$2,updatedAt=$3 WHERE id=$4", user_table_name), [newProfilePic?.url, newProfilePic?.public_id, updatedAt, req.user.id]);
    const updatedUser = await db.query(pgFormat("SELECT username,email,profileImage,profileImageId FROM %I Where id=$1", user_table_name), [req.user.id]);
    res.status(200).json(new apiResponse(201, updatedUser.rows[0], "Profile image successfully updated"));
});

const artistTotalViews = asyncHandler(async (req, res) => {
    const viewStats = await db.query(pgFormat("SELECT COALESCE(SUM(views), 0) AS total_views FROM %I WHERE artist_id=$1", canvas_table_name),
        [req.user.id]
    );
    const totalViews = parseInt(viewStats.rows[0].total_views);
    return res.status(200).json(new apiResponse(200, totalViews, "Total views successsfully fetched."));
});

const artistTotalSubscribers = asyncHandler(async (req, res) => {
    const subStats = await db.query(pgFormat("SELECT count(s.id) AS total_subs FROM %I s WHERE subscribedTo_id=$1", sub_table_name), [req.user.id]);
    const totalSubs = parseInt(subStats.rows[0].total_subs);
    return res.status(200).json(new apiResponse(200, totalSubs, "Total subs successsfully fetched."));
});

const artistTotalCanvases = asyncHandler(async (req, res) => {
    const canvasStats = await db.query(pgFormat("SELECT count(c.id) AS total_canvases FROM %I c WHERE artist_id=$1", canvas_table_name), [req.user.id]);
    const totalCanvases = parseInt(canvasStats.rows[0].total_canvases);
    return res.status(200).json(new apiResponse(200, totalCanvases, "Total canvas(s) successsfully fetched."));

});

const artistTotalLikes = asyncHandler(async (req, res) => {
    const likeStatsCanvas = await db.query(pgFormat("SELECT COUNT(l.id) AS likes FROM %I l JOIN %I c ON l.likedToCanvas_id = c.id WHERE c.artist_id = $1", like_table_name, canvas_table_name), [req.user.id]);
    const likeStatsComment = await db.query(pgFormat("SELECT COUNT(l.id) AS likes FROM %I l JOIN %I c ON l.likedToComment_id = c.id WHERE c.artist_id = $1", like_table_name, canvas_table_name), [req.user.id]);
    const totalLikes = parseInt(likeStatsCanvas.rows[0].likes) + parseInt(likeStatsComment.rows[0].likes);
    return res.status(200).json(new apiResponse(200, totalLikes, "Total likes successsfully fetched."));
});

const artistTotalLikesCanvases = asyncHandler(async (req, res) => {
    const likeStats = await db.query(pgFormat("SELECT COUNT(l.id) AS likes FROM %I l JOIN %I c ON l.likedToCanvas_id = c.id WHERE c.artist_id = $1", like_table_name, canvas_table_name), [req.user.id]);
    const totalLikesCanvases = parseInt(likeStats.rows[0].likes);
    return res.status(200).json(new apiResponse(200, totalLikesCanvases, "Total likes on canvas(s) successsfully fetched."));
});

const artistTotalLikesComments = asyncHandler(async (req, res) => {
    const likeStats = await db.query(pgFormat("SELECT COUNT(l.id) AS likes FROM %I l JOIN %I c ON l.likedToComment_id = c.id WHERE c.artist_id = $1", like_table_name, canvas_table_name), [req.user.id]);
    const totalLikesComments = parseInt(likeStats.rows[0].likes);
    return res.status(200).json(new apiResponse(200, totalLikesComments, "Total likes on comment(s) successsfully fetched."));
});

export {
    getCurrentUser, updateCurrentPassword,
    updateAccountInfo, updateProfilePic, artistTotalViews,
    artistTotalSubscribers, artistTotalCanvases,
    artistTotalLikes, artistTotalLikesCanvases, artistTotalLikesComments
};