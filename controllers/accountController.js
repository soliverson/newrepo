// Requirements
const utilities = require('../utilities/');
const accountModel = require('../models/account-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  let welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  res.render('account/login', {
    title: 'Login',
    welcomeAccount,
    nav,
    errors: null,
  });
}

/*****************************
 * Build default account view
 ****************************/
async function buildDefaultAccount(req, res, next) {
  let nav = await utilities.getNav();
  let welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  let inventoryManagement = utilities.renderAdmisnistrativeClient(
    res,
    utilities.buildInventoryManagement,
    () => {}
  );
  req.flash('notice', `You are logged in`);
  res.render('account/default', {
    title: 'Account Management',
    welcomeAccount,
    inventoryManagement,
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view (AKA Build Registration view)
 * *************************************** */
async function registerIndividual(req, res, next) {
  let nav = await utilities.getNav();
  let welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  res.render('account/register', {
    title: 'Register',
    welcomeAccount,
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  let welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      'notice',
      'Sorry, there was an error processing the registration.'
    );
    res.status(500).render('account/register', {
      title: 'Registration',
      welcomeAccount,
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      'notice',
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render('account/login', {
      title: 'Login',
      welcomeAccount,
      nav,
      errors: null,
    });
  } else {
    req.flash('notice', 'Sorry, the registration failed.');
    res.status(501).render('account/register', {
      title: 'Registration',
      welcomeAccount,
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  let welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash('notice', 'Please check your credentials and try again.');
    res.status(400).render('account/login', {
      title: 'Login',
      welcomeAccount,
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 }
      );
      if (process.env.NODE_ENV === 'development') {
        res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie('jwt', accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect('/account/');
    }
  } catch (error) {
    return new Error('Access Forbidden');
  }
}

/**
 * This function builds the edit account view
 */
async function buildAccountEdit(req, res, next) {
  let nav = await utilities.getNav();
  let welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  res.render('account/update', {
    title: 'Edit Account',
    welcomeAccount,
    nav,
    errors: null,
  });
}

/**
 * This function controls the render of the next view
 */
async function editInfo(req, res) {
  let nav = await utilities.getNav();
  let welcomeAccount = await utilities.checkLoginWelcomeAccount(res);

  const { account_id, account_firstname, account_lastname, account_email } =
    req.body;

  const accountChange = await accountModel.updateAccountInfo(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  );

  if (!accountChange) {
    req.flash('notice', 'there was a mistake updating information');
    res.status(400).render('account/update', {
      title: 'Edit Account',
      welcomeAccount,
      nav,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
      errors: null,
    });
  } else {
    req.flash('notice', 'The account information was updated');
    res.redirect('/edit/');
  }
}

/**
 * This function edits the password in the database and renders a view once it is successful
 */
async function editPassword(req, res) {
  console.log('the request is reaching here');
  let nav = await utilities.getNav();
  let welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  const { account_id, account_password } = req.body;

  const updatePassword = await accountModel.updatePassword(
    account_id,
    account_password
  );

  if (updatePassword) {
    req.flash('notice', 'Your password has been updated');
    res.redirect('/inv/');
  } else {
    req.flash('notice', 'Sorry the password update failed');
    res.status(501).render('account/update', {
      title: 'Edit Account',
      welcomeAccount,
      nav,
      errors: null,
      account_id,
      account_password,
      account_firstname: res.accountData.account_firstname,
      account_lastname: res.accountData.account_lastname,
      account_email: res.accountData.account_email,
    });
  }
}

async function logout(req, res) {
  try {
    // Clear the 'jwt' cookie
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', // Only use secure cookies in production
    });

    // Redirect to the home page
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error during logout.');
  }
}

module.exports = {
  buildLogin,
  registerIndividual,
  registerAccount,
  accountLogin,
  buildDefaultAccount,
  buildAccountEdit,
  editInfo,
  editPassword,
  logout,
};