import passport from "passport";

const registerUserGoogleAuth = passport.authenticate("google", {
    scope: ["openid", "profile", "email"]
});


const authorizeUserGoogleAuth = [
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/");
    }
];

export { registerUserGoogleAuth, authorizeUserGoogleAuth };