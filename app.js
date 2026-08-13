import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
// Utils
import { initPassport } from "./config/passport.js"
// logger
import winLogger from "./utilities/winston.logger.js";
// middleware
import "./middlewares/oauth.middleware.js"
import "./middlewares/auth.middleware.js"
import { verifyUser } from "./middlewares/verify.middleware.js";
// routes
import oauthRoutes from "./routes/oauth.routes.js"
import authRoutes from "./routes/auth.routes.js"
import canvasRoutes from "./routes/canvas.routes.js"
import commentRoutes from "./routes/comment.routes.js";
import likeRoutes from "./routes/like.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import healthcheckRoutes from "./routes/healthcheck.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const morganLoggerFormat = ":method :url :status :response-time ms";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../.env") });

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true if HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
}));
app.use(morgan(morganLoggerFormat, {
    stream: {
        write: (message) => {
            const logObject = {
                method: message.split(' ')[0],
                url: message.split(' ')[1],
                status: message.split(' ')[2],
                responseTiem: message.split(' ')[3]
            };
            winLogger.info(JSON.stringify(logObject));
        }
    }
}));

initPassport(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth/google", oauthRoutes);
app.use("/users/sign", authRoutes);
app.use("/user", verifyUser, userRoutes);
app.use("/canvases", verifyUser, canvasRoutes);
app.use("/comments", verifyUser, commentRoutes);
app.use("/likes", verifyUser, likeRoutes);
app.use("/subs", verifyUser, subscriptionRoutes);
app.use("/api", verifyUser, healthcheckRoutes);


app.get("/", (req, res) => {
    return res.json({ "Page": "Home Page", "user": `${req.isAuthenticated() ? '' : 'un-'}authorized` });
});

export default app;