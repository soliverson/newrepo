// Needed Resources
const express = require('express');
const router = new express.Router();
const invController = require('../controllers/invController');
const utilities = require('../utilities');
const classValidate = require('../utilities/classification-validation');
const invenValidate = require('../utilities/inventory-validation');

// Route to build inventory by classification view
router.get(
  '/type/:classificationId',
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build a specific inventory item detail view
router.get(
  '/detail/:inventoryId',
  utilities.handleErrors(invController.buildByInventoryId)
);

// management view
router.get(
  '/',
  utilities.checkLogin,
  utilities.checkAdministrativeLogin,
  utilities.handleErrors(invController.buildInventoryManager)
);

// Route to build add-classification view
router.get(
  '/add-classification/',
  utilities.handleErrors(invController.buildClassificationView)
);

// Route when adding a new classification
router.post(
  '/add-classification/',
  classValidate.classificationRules(),
  classValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
);

// builds the add-inventory view
router.get(
  '/add-inventory/',
  utilities.handleErrors(invController.buildAddInventoryView)
);
// Route when adding a new car to the inventory
router.post(
  '/add-inventory/',
  invenValidate.inventoryRules(),
  invenValidate.checkInvenData,
  utilities.handleErrors(invController.addInventory)
);
// this route supplies the query for cars with a certain classification
router.get(
  '/getInventory/:classification_id',
  utilities.handleErrors(invController.getInventoryJSON)
);

// This route builds a view specific for a car based on the car id
router.get(
  '/edit/:inventory_id',
  utilities.handleErrors(invController.buildInventoryEditView)
);

// Route that handles the update of an item in the inventory
router.post(
  '/update/',
  invenValidate.inventoryRules(),
  invenValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Route to the delete view
router.get(
  '/delete/:inventory_id',
  utilities.handleErrors(invController.buildDeleteView)
);

// this routes handles the request to delete a vehicle
router.post(
  '/delete-vehicle/',
  utilities.handleErrors(invController.deleteInventory)
);

module.exports = router;