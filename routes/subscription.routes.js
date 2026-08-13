import express from "express";
import bodyParser from "body-parser";
import {
    channelSubscribers, channelsSubscribed,
    toggleSubscription, subscriptionStatus
} from "../controllers/subscription.controller.js";;

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

router.route("/s/by").get(channelSubscribers);

router.route("/s/to").get(channelsSubscribed);

router.route("/status/:channelId").get(subscriptionStatus);

router.route("/toggle/:channelId").post(toggleSubscription);


export default router;