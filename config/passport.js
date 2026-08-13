import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import pgFormat from "pg-format";
import { db } from "./db.js";
import { user_table_name } from "../models/user.model.js";

export function initPassport(passport) {
    passport.use(
        new LocalStrategy(
            { usernameField: "email" }, // login with email
            async (email, password, done) => {
                try {
                    const result = await db.query(
                        pgFormat("SELECT * FROM %I WHERE email=$1", user_table_name),
                        [email]
                    );

                    if (result.rowCount === 0) {
                        return done(null, false, { message: "User not found" });
                    }

                    const user = result.rows[0];
                    const match = await bcrypt.compare(password, user.password);

                    if (!match) {
                        return done(null, false, { message: "Invalid password" });
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const result = await db.query(pgFormat("SELECT * FROM %I WHERE id=$1", user_table_name), [id]);
            done(null, result.rows[0]);
        } catch (err) {
            done(err, null);
        }
    });
}
