import { db } from "../config/db.js"
import pgFormat from "pg-format";
import { sub_table_name } from "../models/subscriptions.model.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { apiError } from "../utilities/apiError.js";
import { apiResponse } from "../utilities/apiResponse.js";
import { user_table_name } from "../models/user.model.js";

const channelSubscribers = asyncHandler(async (req, res) => {
    const channelId = req.user.id;
    try {
        const subscribers = await db.query(pgFormat(`SELECT u.id, u.username, u.email
                                                    FROM %I s
                                                    JOIN %I u
                                                    ON s.subscribedby_id = u.id
                                                    WHERE s.subscribedTo_id = $1`,
            sub_table_name, user_table_name), [channelId]);
        res.status(200).json(new apiResponse(200, subscribers.rows, "Subscribers channel fetched successfully."));
    } catch (e) {
        throw new apiError(400, "Error fetching subscribers channel.");
    }
});

const channelsSubscribed = asyncHandler(async (req, res) => {
    const channelId = req.user.id;
    try {
        const subscribedTo = await db.query(pgFormat(`SELECT u.id,u.username,u.email
                                                    FROM %I s
                                                    JOIN %I u
                                                    ON s.subscribedTo_id = u.id
                                                    WHERE s.subscribedby_id=$1`,
            sub_table_name, user_table_name), [channelId]);
        res.status(200).json(new apiResponse(200, subscribedTo.rows, "Subscribed channel(s) fetched successfully."));
    } catch (e) {
        throw new apiError(400, "Error fetching subscribed channel(s).");
    }
});

const subscriptionStatus = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    try {
        const subStatus = await db.query(pgFormat("SELECT EXISTS (SELECT 1 FROM %I WHERE subscribedby_id=$1 AND subscribedTo_id=$2)", sub_table_name), [req.user.id, channelId]);
        res.status(200).json(new apiResponse(200, { "subStatus": subStatus.rows[0].exists }, "Subsciption status fetched successfully."));
    } catch (e) {
        throw new apiError(400, "Error fetching subsciption status.");
    }
});

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const user_id = req.user.id;
    try {
        const subStatus = await db.query(pgFormat("SELECT EXISTS (SELECT 1 FROM %I WHERE subscribedby_id=$1 AND subscribedTo_id=$2)", sub_table_name), [user_id, channelId]);
        if (subStatus.rows[0].exists) {
            try {
                const unsubChannel = await db.query(pgFormat("DELETE FROM %I WHERE subscribedby_id=$1 AND subscribedTo_id=$2", sub_table_name), [user_id, channelId]);
                res.status(200).json(new apiResponse(200, { "subStatus": false }, "channel un-subscribed successfully."));
            } catch (e) {
                throw new apiError(400, "Error un-subscribing channel");
            }
        } else {
            try {
                const subChannel = await db.query(pgFormat("INSERT INTO %I (subscribedby_id,subscribedTo_id) VALUES ($1,$2)", sub_table_name), [user_id, channelId]);
                res.status(200).json(new apiResponse(200, { "subStatus": true }, "channel subscribed successfully."));
            } catch (e) {
                throw new apiError(400, "Error subscribing channel");
            }
        }
    } catch (e) {
        throw new apiError(400, "Error toggling subsciption.");
    }
});


export {
    channelSubscribers, channelsSubscribed,
    toggleSubscription, subscriptionStatus
};