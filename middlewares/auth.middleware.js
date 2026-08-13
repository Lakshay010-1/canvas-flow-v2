import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import { user_table_name } from "../models/user.model.js";
import pgFormat from "pg-format";
import passport from "passport";


passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
        try {
            const result = await db.query(pgFormat("SELECT * FROM %I WHERE email = %L", user_table_name, email));
            if (result.rows.length === 0) {
                return done(null, false, { message: "No user with that email" });
            }
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password);
            if (!match) return done(null, false, { message: "Wrong password" });
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);
