import express from "express";
import bodyParser from "body-parser";
import {
        createCanvas, updateCanvas, deleteCanvas,
        fetchAllCanvases, fetchArtistCanvases, fetchCanvas
} from "../controllers/canvas.controller.js";


const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

router.route("/")
        .get(fetchAllCanvases);

router.route("/by/:artist_id")
        .get(fetchArtistCanvases);

router.route("/canvas")
        .post(createCanvas);

router.route("/canvas/:canvas_id")
        .get(fetchCanvas)
        .patch(updateCanvas)
        .delete(deleteCanvas);


export default router;