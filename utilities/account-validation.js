const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");
const classificationModel = require("../models/classification-model");

/* **********************************
 * Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    // Firstname is required and must be a valid string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // Lastname is required and must be a valid string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    // Email validation (valid email, cannot already exist in DB)
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.");
        }
      }),

    // Password validation (strong password rules)
    body("account_password")
      .trim()
      .notEmpty()
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
 * Check registration data and return errors or continue
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();

    // Re-render the registration form with error messages and user inputs
    return res.render("account/register", {
      errors: errors.array(), // Convert errors to array
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email, // Keep form fields "sticky"
    });
  }
  next();
};

/* **********************************
 * Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    // Valid email is required
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // Password is required (simple check for login)
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};

/* ******************************
 * Check login data and return errors or continue
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};

/* **********************************
 * Vehicle Data Validation Rules
 * ********************************* */
validate.vehicleRules = () => {
  return [
    // Make is required and must be at least 3 characters long
    body("inv_make")
      .trim()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Make is required and must be at least 3 characters long."),

    // Model is required and must be at least 3 characters long
    body("inv_model")
      .trim()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Model is required and must be at least 3 characters long."),

    // Year is required and must be a valid year
    body("inv_year")
      .trim()
      .notEmpty()
      .isNumeric()
      .custom(value => {
        const currentYear = new Date().getFullYear();
        if (value < 1900 || value > currentYear) {
          throw new Error(`Year must be between 1900 and ${currentYear}.`);
        }
        return true;
      }),

    // Description is required
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),

    // Image Path is required
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),

    // Thumbnail Path is required
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),

    // Price is required and must be a valid number greater than 0
    body("inv_price")
      .trim()
      .notEmpty()
      .isNumeric()
      .custom(value => {
        if (value <= 0) {
          throw new Error("Price must be a valid number greater than zero.");
        }
        return true;
      }),

    // Miles is required and must be a non-negative number
    body("inv_miles")
      .trim()
      .notEmpty()
      .isNumeric()
      .custom(value => {
        if (value < 0) {
          throw new Error("Miles must be a valid non-negative number.");
        }
        return true;
      }),

    // Color is required and must be at least 3 characters long
    body("inv_color")
      .trim()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Color is required and must be at least 3 characters long."),
  ];
};

/* ******************************
 * Check vehicle data and return errors or continue
 * ***************************** */
validate.checkVehicleData = async (req, res, next) => {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classifications = await classificationModel.findAllClassifications(); // Fetch classifications from the DB

    res.render("inventory/add-inventory", {
      errors: errors.array(),
      title: "Add a New Vehicle",
      nav,
      classifications,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
    return;
  }
  next();
};

module.exports = validate;
