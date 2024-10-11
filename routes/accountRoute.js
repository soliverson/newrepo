const express = require("express");
const router = express.Router();
const accountController = require('../controllers/accountController');
const utilities = require('../utilities');
const regValidate = require('../utilities/account-validation');

// Route to deliver login view
router.get("/login", utilities.handleErrors(accountController.buildLogin)); // Accessed via /account/login

// Route to deliver register view
router.get("/register", utilities.handleErrors(accountController.buildRegister)); // Accessed via /account/register

// Process the login data (POST request)
router.post("/login", utilities.handleErrors(accountController.processLogin));

// Process the registration data (POST request with validation)
router.post(
    "/register",
    regValidate.registrationRules(),      // Registration validation rules
    regValidate.checkRegData,            // Validation data check
    utilities.handleErrors(accountController.registerAccount)  // Register the account
);

module.exports = router;
