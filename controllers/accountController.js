const utilities = require('../utilities');
const accountModel = require('../models/account-model');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/register", {
        title: "Register",
        nav,
        account_firstname: "",
        account_lastname: "",
        account_email: "",
        errors: null,
    });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    // Hash the password before storing
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(account_password, 10); 
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.');
        return res.status(500).render("account/register", {
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            errors: null,
        });
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword,
    );
    
    if (regResult) {
        req.flash("notice-success", `Congratulations, you're registered ${account_firstname}. Please log in.`);
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        });
    } else {
        req.flash("notice", "Sorry, the registration failed.");
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            errors: null,
        });
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav();
    const { account_email, account_password } = req.body;
    const accountData = await accountModel.getAccountByEmail(account_email);

    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.");
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        });
        return;
    }
    
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password;
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });
            
            res.cookie("jwt", accessToken, { httpOnly: true, secure: process.env.NODE_ENV !== 'development', maxAge: 3600 * 1000 });
            req.flash("notice-success", "You have logged in.");
            res.locals.account_firstname = accountData.account_firstname;
            res.redirect("/account/");
        } else {
            req.flash("notice", "Sorry, Invalid email or password.");
            res.status(401).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            });
        }
    } catch (error) {
        console.error("Error during login:", error);
        throw new Error('Access Forbidden');
    }
}

/* ****************************************
 *  Deliver Management view
 * ************************************ */
async function buildManagement(req, res, next) {
    let nav = await utilities.getNav();
    let link = await utilities.buildAccountLink(res.locals.accountData);
    
    if (!res.locals.accountData) {
        req.flash("notice", "Account data not found.");
        return res.redirect("/account/login");
    }

    try {
        let unreadMsgNum = await utilities.getUnreadMsgNum(res.locals.accountData.account_id);
        res.render("account/management", {
            nav,
            title: "Account Management",
            errors: null,
            account_firstname: res.locals.accountData.account_firstname,
            link,
            unreadMsgNum,
            accountData: res.locals.accountData // Pass account data for EJS access
        });
    } catch (error) {
        console.error("Error retrieving messages:", error);
        req.flash("notice", "Failed to retrieve messages.");
        return res.redirect("/account");
    }
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
    res.clearCookie("jwt");
    req.flash("notice-success", "You have successfully logged out.");
    res.redirect("/");
}

/* ****************************************
 *  Build update account view
 * ************************************ */
async function buildUpdateView(req, res, next) {
    let nav = await utilities.getNav();
    const accountId = req.params.account_id; // Ensure account ID is retrieved from route params

    try {
        const accountData = await accountModel.getAccountById(accountId); // Fetch the account details
        if (!accountData) {
            req.flash("notice", "Account not found.");
            return res.redirect("/account");
        }

        res.render("account/edit-account", {
            nav,
            title: "Edit Account",
            account_firstname: accountData.account_firstname,
            account_lastname: accountData.account_lastname,
            account_email: accountData.account_email,
            account_id: accountData.account_id,
            errors: null,
        });
    } catch (error) {
        console.error("Error in buildUpdateView:", error);
        next(error);
    }
}

module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin,
    buildManagement,
    accountLogout,
    buildUpdateView,
};
