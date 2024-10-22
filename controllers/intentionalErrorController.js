const utilities = require('../utilities/');

const errorCont = {};

errorCont.faultyFunction = async function (req, res, next) {
  res.render('index', {
    welcomeAccount,
    nav,
  });
};

module.export = errorCont;