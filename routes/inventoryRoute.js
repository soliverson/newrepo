// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require('../utilities');
const regValidate = require('../utilities/account-validation');

// Vehicle Routes

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to handle vehicle detail requests by invId
router.get("/detail/:invId", utilities.handleErrors(invController.getVehicleDetails));

// Route to trigger a server error (for testing purposes)
router.get('/trigger-error', utilities.handleErrors(invController.triggerServerError));

// GET route for rendering the add vehicle form
router.get('/add-vehicle', utilities.handleErrors(invController.renderAddVehicleForm));

// POST route to process vehicle data and add a vehicle
router.post(
    '/add-vehicle',
    regValidate.vehicleRules(),        // Apply vehicle validation rules
    regValidate.checkVehicleData,      // Check validation data
    utilities.handleErrors(invController.addVehicle) // Handle errors during vehicle addition
);

// Route to render the inventory management view
router.get('/', utilities.handleErrors(invController.managementView));

// GET route to render the add classification form
router.get('/add-classification', async (req, res) => {
    const nav = await utilities.getNav(req, res); // Fetch the navigation
    res.render('inventory/add-classification', {
        nav,
        title: 'Add Classification',
    });
});

// Export the router
module.exports = router;
