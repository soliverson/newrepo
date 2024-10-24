const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv").config();
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require('./config/passport-config');
const pool = require('./database/');
const utilities = require("./utilities/");
const staticRoutes = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require('./routes/accountRoute');
const messageRoute = require("./routes/messageRoute");
const feedbackRoute = require('./routes/feedbackRoute');

// Initialize Application
const app = express();

// Session Configuration
app.use(session({
    store: new (require('connect-pg-simple')(session))({
        createTableIfMissing: true,
        pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session()); // Configure Passport sessions

// Flash Messages Middleware
app.use(flash());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Body Parsing Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(utilities.checkJWTToken); // Optional, based on your auth flow

// View Engine Configuration
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

// Routes Configuration
app.use(staticRoutes);
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);
app.use("/message", messageRoute);
app.use("/feedback", feedbackRoute);

// File Not Found Route
app.use((req, res, next) => {
    next({ status: 404, message: 'Sorry, we appear to have lost that page.' });
});

// Express Error Handling
app.use(async (err, req, res, next) => {
    let nav = await utilities.getNav();
    console.error(`Error at: "${req.originalUrl}": ${err.message}`);
    const message = err.status === 404 ? err.message : 'Oh no! There was a crash. Maybe try a different route?';
    res.render("errors/error", {
        title: err.status || 'Server Error',
        message,
        nav,
    });
});

// Local Server Information
const port = process.env.PORT || 5500;
const host = process.env.HOST || 'localhost';

app.listen(port, () => {
    console.log(`App listening on ${host}:${port}`);
});
