// Requirements
const utilities = require('.');
const inventoryModel = require('../models/inventory-model');
const { body, validationResult } = require('express-validator');

const validate = {};

/**
 * Classification Data validation Rules
 */

validate.classificationRules = () => {
  return [
    body('classification_name')
      .notEmpty()
      // Checks for spaces with a custom check
      .custom((classification_name) => {
        if (/\s/.test(classification_name)) {
          throw new Error('Classification does not allow for spaces');
        }
        return true;
      })
      .isAlpha()
      .isLength({ min: 1 })
      .withMessage('A valid classification is required')
      .custom(async (classification_name) => {
        const classificationExists =
          await inventoryModel.checkExistingClassification(classification_name);
        if (classificationExists) {
          throw new Error(
            'Classification exists. Please enter a different classification'
          );
        }
      })
      .escape(),
  ];
};

validate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
    res.render('inventory/add-classification', {
      errors,
      title: 'Add Classification',
      welcomeAccount,
      nav,
      classification_name,
    });
    return;
  }
  next();
};

module.exports = validate;