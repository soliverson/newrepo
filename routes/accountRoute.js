const express = require('express');
const router = express.Router();
const accountController = require("../controllers/accountController"); 
const utilities = require("../utilities");

// GET route for rendering the login page
router.get("/login", async (req, res) => {
    const nav = await utilities.getNav(req, res); // Fetch the navigation for the page
    res.render("account/login", {
        title: "Login",
        nav
    });
});

// GET route for rendering the registration page
router.get("/register", async (req, res) => {
    const nav = await utilities.getNav(req, res); // Fetch the navigation
    res.render("account/register", {
        title: "Register",
        nav,
        errors: [], // Ensure errors is defined, even if empty
        account_firstname: '', // Provide empty values for the form fields
        account_lastname: '',
        account_email: ''
    });
});

// POST route for processing the login form submission
router.post("/login", utilities.handleErrors(accountController.login));

// POST route for processing the registration form submission
router.post("/register", utilities.handleErrors(async (req, res) => {
    const { account_firstname, account_lastname, account_email, account_password } = req.body;
    const nav = await utilities.getNav(req, res);

    const errors = [];

    // Basic validation (expand this as needed)
    if (!account_firstname) {
        errors.push({ msg: "First name is required" });
    }
    if (!account_lastname) {
        errors.push({ msg: "Last name is required" });
    }
    if (!account_email) {
        errors.push({ msg: "Email is required" });
    }

    // If there are errors, re-render the form with the errors and user input
    if (errors.length > 0) {
        return res.render("account/register", {
            title: "Register",
            nav,
            errors,
            account_firstname,
            account_lastname,
            account_email
        });
    }

    // Continue with registration logic if no errors (e.g., saving to database)
    await accountController.register(req, res);
}));

// Export the router
module.exports = router;
