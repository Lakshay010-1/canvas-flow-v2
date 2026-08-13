import express from "express";
import { authorizeUserGoogleAuth, registerUserGoogleAuth } from "../controllers/oauth.controller.js";

const router = express.Router();

router.get("/", registerUserGoogleAuth);

router.get("/canvas", authorizeUserGoogleAuth);



export default router;