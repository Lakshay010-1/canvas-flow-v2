import { db } from "../config/db.js"
import pgFormat from "pg-format";
import { canvas_table_name } from "../models/canvas.model.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { apiResponse } from "../utilities/apiResponse.js";
import { apiError } from "../utilities/apiError.js";

const updateCanvasViews = async (canvas_id) => {
    try {
        const updateCanvasViews = await db.query(pgFormat("UPDATE %I SET views=views+1 WHERE id=$1", canvas_table_name), [canvas_id]);
        // res.status(200).json(new apiResponse(200,updateCanvasViews.rowCount,"Canvas views successfully updated."));
        return updateCanvasViews.rowCount;
    } catch (e) {
        throw new apiError(400, "Error updating canvas views.");
    }
};

const createCanvas = asyncHandler(async (req, res) => {
    const { title, canvas } = req.body;
    const artist_id = req.user.id;
    const views = 0;
    const createdAt = new Date();
    let bufferCanvas = null;
    if (canvas) {
        bufferCanvas = Buffer.from(canvas.replace(/^E\\x/, ""), "hex");
    }
    try {
        const addCanvas = await db.query(
            pgFormat(
                "INSERT INTO %I (title, canvas, artist_id, views, createdAt) VALUES ($1, $2, $3, $4, $5) RETURNING *",
                canvas_table_name
            ),
            [title, bufferCanvas, artist_id, 0, createdAt] // views initialized to 0
        );

        res.status(201).json(new apiResponse(201, addCanvas.rows[0], "Canvas created successfully."));
    } catch (e) {
        throw new apiError(400, "Error creating canvas.");
    }
});

const fetchAllCanvases = asyncHandler(async (req, res) => {
    try {
        const canvases = await db.query(pgFormat("SELECT * FROM %I", canvas_table_name));
        res.status(200).json(new apiResponse(200, canvases.rows, "Canvases fetched successfully."));
    } catch (e) {
        throw new apiError(400, "Error fetching canvases.");
    }
});

const fetchCanvas = asyncHandler(async (req, res) => {
    const { canvas_id } = req.params;
    await updateCanvasViews(canvas_id);
    try {
        const canvas = await db.query(pgFormat("SELECT * FROM %I WHERE id=$1", canvas_table_name), [canvas_id]);
        res.status(200).json(new apiResponse(200, canvas.rows[0], "Canvas fetched successfully."));
    } catch (e) {
        throw new apiError(400, "Error fetching canvas.");
    }
});

const fetchArtistCanvases = asyncHandler(async (req, res) => {
    const { artist_id } = req.params;
    try {
        const artistCanvases = await db.query(pgFormat("SELECT * FROM %I WHERE artist_id=$1", canvas_table_name), [artist_id]);
        res.status(200).json(new apiResponse(200, artistCanvases.rows, "Artist canvases fetched successfully."));
    } catch (e) {
        throw new apiError(400, "Error fetching artist canvases.");
    }
});

const updateCanvas = asyncHandler(async (req, res) => {
    const { canvas_id } = req.params;
    const { title, canvas } = req.body;
    const updatedAt = new Date();
    let bufferCanvas = null;
    if (canvas) {
        bufferCanvas = Buffer.from(canvas.replace(/^E\\x/, ""), "hex");
    }
    try {
        const modifiedCanvas = await db.query(pgFormat("UPDATE %I SET title=$1, canvas=$2, updatedAt=$3 WHERE id=$4 RETURNING *", canvas_table_name), [title, bufferCanvas, updatedAt, canvas_id]);
        res.status(200).json(new apiResponse(200, modifiedCanvas.rows[0], "Canvas updated successfully."));
    } catch (e) {
        throw new apiError(400, "Error updating canvas.");
    }
});

const deleteCanvas = asyncHandler(async (req, res) => {
    const { canvas_id } = req.params;
    try {
        const canvas = await db.query(pgFormat("DELETE FROM %I WHERE id=$1 RETURNING *", canvas_table_name), [canvas_id]);
        res.status(200).json(new apiResponse(200, canvas.rowCount, "Canvas deleted successfully."));
    } catch (e) {
        throw new apiError(400, "Error deleting canvas.");
    }
});

export {
    createCanvas, updateCanvas, deleteCanvas,
    fetchAllCanvases, fetchArtistCanvases, fetchCanvas
};