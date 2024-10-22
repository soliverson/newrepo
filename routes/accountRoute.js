const express = require("express");
const router = express.Router();
const accountController = require('../controllers/accountController');
const utilities = require('../utilities');
const regValidate = require('../utilities/account-validation');

// Route to deliver login view
router.get("/login", utilities.handleErrors(accountController.buildLogin)); // Accessed via /account/login
router.get('/logout', accountController.logout);

// Route to deliver register view
router.get("/register", utilities.handleErrors(accountController.buildRegister)); // Accessed via /account/register

// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Route to process the registration form with error handling
router.post('/register', utilities.handleErrors(accountController.registerAccount));

// Process the login route
router.post(
    "/login",
    regValidate.loginRules(),          // Validate login data
    regValidate.checkLoginData,        // Check for validation errors
    utilities.handleErrors(accountController.accountLogin)     // Handle login logic
);

router.get('/',
    utilities.checkLogin,
    accountController.accountManagementView);

// GET route to deliver the account update view
router.get('/update/:account_id', 
    utilities.handleErrors(accountController.getAccountUpdateView));

// POST route to process account updates
router.post('/update/:account_id', 
    regValidate.validateUpdate, 
    utilities.handleErrors(accountController.processAccountUpdate));

// POST route to process password updates
router.post('/update-password', 
    regValidate.validatePassword, 
    utilities.handleErrors(accountController.processPasswordUpdate));
    
module.exports = router;