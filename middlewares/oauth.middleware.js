import passport from "passport";
import OAuth2Strategy from "passport-oauth2";
import axios from "axios";
import { db } from "../config/db.js";
import { user_table_name } from "../models/user.model.js";
import pgFormat from "pg-format";

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const { rows } = await db.query(pgFormat("SELECT * FROM %I WHERE id = %L", user_table_name, id));
        done(null, rows[0]);
    } catch (err) {
        done(err, null);
    }
});

const strategy = new OAuth2Strategy(
    {
        authorizationURL: process.env.AUTH_URI,
        tokenURL: process.env.TOKEN_URI,
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
        state: true,                             // CSRF protection
    },
    async (accessToken, refreshToken, params, profile, done) => {
        try {
            const { data } = await axios.get(
                process.env.OAUTH_USERINFO_URL,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const { sub, name, email, picture } = data;
            const { rows } = await db.query(pgFormat("SELECT * FROM %I WHERE google_id = %L", user_table_name, sub));
            const createdAt = new Date();
            if (rows.length > 0) {
                return done(null, rows[0]);
            }
            const newUser = await db.query(pgFormat("INSERT INTO %I (google_id, username, email, profileImage,createdAt) VALUES ($1, $2 ,$3 ,$4, $5) RETURNING *",
                user_table_name),
                [sub, name, email, picture, createdAt]);
            return done(null, newUser.rows[0]);
        } catch (err) {
            return done(err);
        }
    }
);

strategy.authorizationParams = function () {
    return { access_type: "offline", prompt: "consent" };
}

passport.use("google", strategy);