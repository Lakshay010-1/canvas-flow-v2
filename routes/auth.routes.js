import express from "express";
import bodyParser from "body-parser";
import { authorizeUser, logoutUser, registerUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.use(express.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.route("/out")
    .get(logoutUser);

router.route("/in")
    .post(authorizeUser);

router.route("/up")
    .post(registerUser);


export default router;