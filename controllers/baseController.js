const utilities = require("../utilities");
const invModel = require("../models/inventory-model");
const baseController = {};

/* ***************************
 *  Build Home View
 * ************************** */
baseController.buildHome = async function (req, res, next) {
    try {
        let nav = await utilities.getNav();
        res.render("home", { title: "Home", nav });
    } catch (error) {
        next(error); // Pass the error to the error handler
    }
};

/* ***************************
 *  Build Inventory by Classification View
 * ************************** */
baseController.buildByClassificationId = async function (req, res, next) {
    try {
        const classification_id = req.params.classificationId;
        const data = await invModel.getInventoryByClassificationId(classification_id);
        const grid = await utilities.buildClassificationGrid(data);
        let nav = await utilities.getNav();
        const className = data[0].classification_name;
        res.render("inventory/classification", {
            title: className + " vehicles",
            nav,
            grid,
        });
    } catch (error) {
        next(error);
    }
};

/* ***************************
 *  Build Details by Inventory ID View
 * ************************** */
baseController.buildByInventoryId = async function (req, res, next) {
    try {
        const inv_id = req.params.invId;
        const data = await invModel.getInventoryByInvId(inv_id);
        const vehicle = data[0];
        const content = await utilities.buildInventoryDetails(vehicle);
        let nav = await utilities.getNav();
        const vehicleName = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;
        res.render("inventory/vehicleDetails", {
            title: vehicleName,
            nav,
            content,
        });
    } catch (error) {
        next(error);
    }
};

/* ***************************
 *  Build Error View
 * ************************** */
baseController.buildError = async function (req, res, next) {
    try {
        const inv_id = 100; // Fictitious ID for demonstration
        const data = await invModel.getInventoryByInvId(inv_id);
        const vehicle = data[0];
        const content = await utilities.buildInventoryDetails(vehicle);
        let nav = await utilities.getNav();
        const vehicleName = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;
        res.render("inventory/vehicleDetails", {
            title: vehicleName,
            nav,
            content,
        });
    } catch (error) {
        next(error);
    }
};

/* ***************************
 *  Build Vehicle Management View
 * ************************** */
baseController.buildManagement = async function (req, res, next) {
    try {
        let nav = await utilities.getNav();
        const classificationSelect = await utilities.buildClassificationList();
        res.render("inventory/management", {
            title: "Vehicle Management",
            nav,
            errors: null,
            classificationSelect,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = baseController;
