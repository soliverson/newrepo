const utilities = require("../utilities");
const accountModel = require('../models/account-model');
const bcrypt = require("bcryptjs");
const { body, validationResult } = require('express-validator');

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav(); // Wait for navigation data
    res.render('account/login', {
      title: 'Login',
      nav,
      errors: null // Pass null errors initially
    });
  } catch (error) {
    console.error("Error rendering login page:", error);
    next(error);
  }
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  try {
    let nav = await utilities.getNav(); // Wait for navigation data
    res.render('account/register', {
      title: 'Register',
      nav,
      errors: null, // Pass null errors initially
      account_firstname: '', // Initialize as empty
      account_lastname: '',  // Initialize as empty
      account_email: ''      // Initialize as empty
    });
  } catch (error) {
    console.error("Error rendering registration page:", error);
    next(error);
  }
}

/* ****************************************
 *  Validation Rules for Registration
 * *************************************** */
const validateRegistration = [
  body('account_firstname').notEmpty().withMessage('First name is required'),
  body('account_lastname').notEmpty().withMessage('Last name is required'),
  body('account_email').isEmail().withMessage('Enter a valid email')
    .custom(async (account_email) => {
      const emailExists = await accountModel.checkExistingEmail(account_email);
      if (emailExists) {
        throw new Error("Email already exists. Please use a different email.");
      }
    }),
  body('account_password').isLength({ min: 12 }).withMessage('Password must be at least 12 characters long')
];

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav(); // Fetch navigation
  const errors = validationResult(req);

  // Handle form validation errors
  if (!errors.isEmpty()) {
    const { account_firstname, account_lastname, account_email } = req.body;  // Extract form inputs
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: errors.array(),
      account_firstname,  // Pass form input back
      account_lastname,   // Pass form input back
      account_email       // Pass form input back
    });
  }

  const { account_firstname, account_lastname, account_email, account_password } = req.body; // Extract form data

  // Hash the password before storing
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10); // Asynchronous hash
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    });
  }

  try {
    // Insert the new account into the database
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult.rowCount) {
      req.flash('notice', `Congratulations, ${account_firstname}! You have successfully registered.`);
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null
      });
    } else {
      throw new Error("Registration failed.");
    }
  } catch (error) {
    console.error("Error processing registration:", error);
    req.flash("error_notice", "Sorry, the registration failed.");
    return res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: [{ msg: error.message }]
    });
  }
}

/* ****************************************
 *  Process Login (POST request)
 * *************************************** */
async function processLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  try {
    // Simulate login logic for now
    req.flash('notice', `Welcome back! You've successfully logged in.`);
    return res.status(200).render('account/dashboard', {
      title: "Dashboard",
      nav,
      errors: null
    });
  } catch (error) {
    console.error("Error processing login:", error);
    req.flash("error_notice", "Login failed. Please try again.");
    return res.status(500).render('account/login', {
      title: "Login",
      nav,
      errors: [{ msg: error.message }]
    });
  }
}

/* ****************************************
 *  Export Controller Functions
 * *************************************** */
module.exports = {
  buildLogin,
  buildRegister,
  validateRegistration,
  registerAccount,
  processLogin
};
