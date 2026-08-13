import passport from "passport";

const verifyUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ "user": "unauthorized" });
};

export { verifyUser };