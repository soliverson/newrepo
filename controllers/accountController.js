const utilities = require("../utilities");
const accountModel = require('../models/account-model');

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav(); // Fetch navigation data
    res.render('account/login', {
      title: 'Login',
      nav,
      errors: null // Initially no errors
    });
  } catch (error) {
    console.error("Error rendering login page:", error);
    next(error); // Pass error to the error handler
  }
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }
  

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    // Call the model to insert new account into the database
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    );

    if (regResult.rowCount) { // Check if the registration was successful
      req.flash('notice', `Congratulations, you're registered ${account_firstname}. Please log in.`);
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null // No errors to display
      });
    } else {
      throw new Error("Registration failed.");
    }
  } catch (error) {
    console.error("Error processing registration:", error);
    req.flash("error_notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: error.message // Pass the error message to the view
    });
  }
}

/* ****************************************
 *  Process Login (POST request)
 * *************************************** */
async function processLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  // Here you would implement your authentication logic (e.g., check credentials)

  try {
    // For now, simulate a login success for demonstration
    // You can later expand this by querying your database and comparing hashed passwords
    req.flash('notice', `Welcome back! You've successfully logged in.`);
    res.status(200).render('account/dashboard', {
      title: "Dashboard",
      nav,
      errors: null // No errors to display
    });
  } catch (error) {
    console.error("Error processing login:", error);
    req.flash("error_notice", "Login failed. Please try again.");
    res.status(500).render('account/login', {
      title: "Login",
      nav,
      errors: error.message // Pass the error message to the view
    });
  }
}

/* ****************************************
 *  Export Controller Functions
 * *************************************** */
module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  processLogin // Don't forget to export the login processing function
};
