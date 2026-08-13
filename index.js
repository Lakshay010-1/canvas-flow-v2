import { connectDB } from "./config/db.js";
import app from "./app.js";

import dotenv from "dotenv";
dotenv.config({ path: './.env' });

(async () => {
    try {
        await connectDB();
        app.listen(process.env.PORT, () => {
            console.log(`Hosted on http://localhost:${process.env.PORT}`);
        });
    } catch (e) {
        console.error("Error establishing connection, ", e);
    }
})();