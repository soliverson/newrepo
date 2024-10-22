const utilities = require('../utilities/');
const baseController = {};

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav();
  const welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  res.render('index', { title: 'Home', welcomeAccount, nav });
};

module.exports = baseController;