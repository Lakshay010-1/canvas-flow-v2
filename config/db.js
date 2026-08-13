import pg from "pg";
import pgFormat from "pg-format";
import dotenv from "dotenv";

import { Canvases, canvas_table_name } from "../models/canvas.model.js";
import { Comments, comment_table_name } from "../models/comments.model.js";
import { Likes, like_table_name } from "../models/likes.model.js";
import { Users, user_table_name } from "../models/user.model.js";
import { Subscriptions, sub_table_name } from "../models/subscriptions.model.js";

// dotenv.config({ path: "../.env" });
dotenv.config();


let db;

const checkTableExists = async (db, table_name) => {
    try {
        const check = await db.query(pgFormat("SELECT to_regclass('public.%I') AS exists;", table_name));
        return check.rows[0].exists;
    } catch (error) {
        console.error("Error fetching tables, ", error);

    }
};

const connectDB = async () => {
    try {
        // Step 1: connect to admin db
        let adminClient;
        try {
            adminClient = new pg.Pool({
                connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/postgres`
            });
        } catch (error) {
            console.error("Error Fetching Database(s), ", error);
            return;
        }

        // Step 2: check if DB exists
        try {
            const isdbExist = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [process.env.DB_NAME]);
            if (isdbExist.rowCount === 0) {
                try {
                    await adminClient.query(pgFormat("CREATE DATABASE %I", process.env.DB_NAME));
                } catch (error) {
                    console.error("Error creating database", error);
                    return;
                }
            }
            await adminClient.end();
        } catch (error) {
            console.error("Error fetching current database, ", error);
            return;
        }

        // Step 3: connect to the target DB
        try {
            db = new pg.Pool({
                connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
            });
        } catch (error) {
            console.error("Error creating database, ", error);
            return;
        }


        // Step 4: create tables
        if (!(await checkTableExists(db, user_table_name))) {
            await Users(db);
        }
        if (!(await checkTableExists(db, canvas_table_name))) {
            await Canvases(db);
        }
        if (!(await checkTableExists(db, sub_table_name))) {
            await Subscriptions(db);
        }
        if (!(await checkTableExists(db, comment_table_name))) {
            await Comments(db);
        }
        if (!(await checkTableExists(db, like_table_name))) {
            await Likes(db);
        }
    } catch (e) {
        console.error("Database Connection Unsuccessful:", e.message);
    }
};

export { db, connectDB }; 