const utilities = require(".");
const accountModel = require("../models/account-model");
const { body, validationResult } = require("express-validator");
const validate = {};

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registrationRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty().withMessage("First name is required.")
            .isLength({ min: 1 }).withMessage("At least 1 character in First name"),

        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty().withMessage("Last name is required.")
            .isLength({ min: 2 }).withMessage("At least 2 characters in Last name"),

        // valid email is required and cannot already exist in the DB
        body("account_email")
            .trim()
            .escape()
            .notEmpty().withMessage("Email is required.")
            .isEmail().withMessage("Email format is not correct.")
            .normalizeEmail() // refer to validator.js docs
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email);
                if (emailExists) {
                    throw new Error("Email exists. Please log in or use a different email");
                }
            }),

        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty().withMessage("Password can't be empty.")
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ];
};

/* ******************************
* Check data and return errors or continue to registration
* ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        });
        return;
    }
    next();
};

/*  **********************************
*  Login Data Validation Rules
* ********************************* */
validate.loginRules = () => {
    return [
        // valid email is required
        body("account_email")
            .trim()
            .escape()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email format is not correct")
            .normalizeEmail() // refer to validator.js docs   
    ];
};

/* ******************************
* Check data and return errors or continue to Login
* ***************************** */
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
        });
        return;
    }
    next();
};

/*  **********************************
*  Update Data Validation Rules
* ********************************* */
validate.updateRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty().withMessage("First name is required.")
            .isLength({ min: 1 }).withMessage("At least 1 character in First name"),

        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty().withMessage("Last name is required.")
            .isLength({ min: 2 }).withMessage("At least 2 characters in Last name"),

        // valid email is required and cannot already exist in the DB
        body("account_email")
            .trim()
            .escape()
            .notEmpty().withMessage("Email is required.")
            .isEmail().withMessage("Email format is not correct.")
            .normalizeEmail() // refer to validator.js docs
    ];
};

/* ******************************
* Check data and return errors or continue to update
* ***************************** */
validate.checkUpdateData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email, account_id } = req.body;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/edit-account", {
            nav,
            title: "Edit Account",
            firstname: account_firstname,
            lastname: account_lastname,
            email: account_email,
            account_id: account_id,
            errors,
        });
        return;
    }
    next();
};

/*  **********************************
*  Update Password Validation Rules
* ********************************* */
validate.updatePWRules = () => {
    return [
        body("account_password")
            .trim()
            .notEmpty().withMessage("Password can't be empty.")
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ];
};

/* ******************************
* Check password and return errors or continue to update
* ***************************** */
validate.checkUpdatePWData = async (req, res, next) => {
    const { account_password, account_id } = req.body;
    let pwErrors = validationResult(req);
    if (!pwErrors.isEmpty()) {
        let nav = await utilities.getNav();
        const errorMSG = pwErrors.array().map(error => `<li>${error.msg}</li>`).join('');
        req.flash("pw-notice", `<ul class="notice" style='width: 400px; margin: auto;'>${errorMSG}</ul>`);
        return res.redirect(`/account/edit-account/${account_id}`);
    }
    next();
};

module.exports = validate;
