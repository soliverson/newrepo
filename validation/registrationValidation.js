const { body, validationResult } = require('express-validator');
const accountModel = require('../models/account-model'); // Ensure correct path to account-model.js
const utilities = require("../utilities"); // Include utilities for fetching navigation

/* ****************************************
 *  Validation Rules for Login
 * *************************************** */
const loginRules = () => [
    body('account_email')
        .isEmail().withMessage('Please enter a valid email address'),
    body('account_password')
        .notEmpty().withMessage('Password cannot be empty')
];

/* ****************************************
 *  Middleware to Check Login Data
 * *************************************** */
const checkLoginData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav(); // Fetch navigation
        return res.status(400).render('account/login', {
            title: 'Login',
            nav,
            errors: errors.array(),
            account_email: req.body.account_email // Keep email "sticky"
        });
    }
    next();
};

/* ****************************************
 *  Validation Rules for Registration
 * *************************************** */
const registrationRules = () => [
    body('account_firstname')
        .notEmpty().withMessage('First name is required'),
    body('account_lastname')
        .notEmpty().withMessage('Last name is required'),
    body('account_email')
        .isEmail().withMessage('Enter a valid email address')
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email);
            if (emailExists) {
                throw new Error("Email already exists. Please use a different email.");
            }
        }),
    body('account_password')
        .isLength({ min: 12 }).withMessage('Password must be at least 12 characters long')
];

/* ****************************************
 *  Middleware to Check Registration Data
 * *************************************** */
const checkRegistrationData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav(); // Fetch navigation
        const { account_firstname, account_lastname, account_email } = req.body; // Keep form data sticky
        return res.status(400).render('account/register', {
            title: 'Register',
            nav,
            errors: errors.array(),
            account_firstname, // Keep values in form fields
            account_lastname,
            account_email
        });
    }
    next();
};

// Export the validation functions
module.exports = {
    loginRules,
    checkLoginData,
    registrationRules,
    checkRegistrationData
};
