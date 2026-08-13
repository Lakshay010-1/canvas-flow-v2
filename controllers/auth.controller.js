import passport from "passport";
import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import pgFormat from "pg-format";
import { user_table_name } from "../models/user.model.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utilities/cloudinary.util.js";
import { apiError } from "../utilities/apiError.js";
import { apiResponse } from "../utilities/apiResponse.js";
import { asyncHandler } from "../utilities/asyncHandler.js";


const logoutUser = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            console.error("Logout error: ", err);
            return next(err);
        }
        res.redirect('/');
    });
};

const authorizeUser = [
    passport.authenticate("local"),
    (req, res) => {
        res.json({ message: "Logged in", user: req.user });
    },
];

const authorizeUser2 = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    let user;
    try {
        user = await db.query(pgFormat("SELECT * FROM %I WHERE email=$1", user_table_name), [email]);
        user = user.rows[0]
    } catch (e) {
        throw new apiError(400, "Error fetching user.");
    }
    if (!user) {
        throw new apiError(404, "User not found.");
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new apiError(400, "Incorrect password");
    }

    // Log in user
    req.login(user, (err) => {
        if (err) {
            next(new apiError(400, "Error loging in"));
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/");
        })
    });
});

const registerUser = [
    upload.fields([{ name: "profilePic", maxCount: 1 }]),
    asyncHandler(async (req, res) => {
        const { email, password, username } = req.body;
        const createdAt = new Date();

        if ([email, password].some(field => !field || field.trim() === "")) {
            throw new apiError(404, "Email and Password both fields are required!");
        }

        // Check if user already exists
        try {
            const isUserExists = await db.query(pgFormat("SELECT * FROM %I WHERE email=$1", user_table_name), [email]);
            if (isUserExists.rows.length > 0) {
                throw new apiError(400, "User already exists.");
            }
        } catch (e) {
            throw new apiError(400, "Error fetching user.");
        }

        // try {
        // Hash Password
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

        // upload profile pic
        let profilePicLocalPath;
        try {
            profilePicLocalPath = req.files?.profilePic?.[0]?.path;
        } catch (e) {
            throw new apiError(500, "Error uploading profile pic");
        }
        if (!profilePicLocalPath) {
            throw new apiError(400, "Profile pic is required.");
        }
        const profilePicCloud = await uploadOnCloudinary(profilePicLocalPath);

        // Insert into Database(Postgres)
        try {
            const newUser = await db.query(pgFormat("INSERT INTO %I (username, email, password, profileImage, profileImageId, createdAt) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *"
                , user_table_name), [username || "", email, hashedPassword, profilePicCloud?.url || "", profilePicCloud?.public_id || "", createdAt]);
            const user = newUser.rows[0];
            res.status(201).json(new apiResponse(201, user, "User registered successfully."));
        } catch (e) {
            if (profilePicCloud) {
                await deleteFromCloudinary(profilePicCloud.public_id);
            }
            throw new apiError(400, "Error creating user.");
        }
        // } catch (e) {
        // throw new apiError(400, "Error registering user.");
        // }
    })
];

export { logoutUser, registerUser, authorizeUser, authorizeUser2 };