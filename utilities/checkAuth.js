const jwt = require("jsonwebtoken");

function checkAuth(req, res, next) {
    const token = req.cookies.jwt;

    if (!token) {
        req.flash("error", "You must be logged in to view this page.");
        return res.redirect("/account/login");
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            req.flash("error", "Session expired. Please log in again.");
            return res.redirect("/account/login");
        }
        req.user = user; // Attach user to request object
        next();
    });
}

module.exports = checkAuth;
