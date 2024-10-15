const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const Classification = require('../models/classification-model');

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    try {
        const classification_id = req.params.classificationId;
        const data = await invModel.getInventoryByClassificationId(classification_id);
        const grid = await utilities.buildClassificationGrid(data);
        let nav = await utilities.getNav();
        const className = data[0].classification_name;
        res.render("./inventory/classification", {
            title: className + " vehicles",
            nav,
            grid,
        });
    } catch (error) {
        next(error); // Pass error to the error handler
    }
};

/* ***************************
 *  Get vehicle details by inventory ID
 * ************************** */
invCont.getVehicleDetails = async function (req, res, next) {
    try {
        const invId = req.params.invId; // Get the vehicle ID from the request parameters
        const vehicleData = await invModel.getVehicleById(invId); // Fetch vehicle details from the model
        const nav = await utilities.getNav(); // Fetch the navigation links

        if (vehicleData) {
            // Build the HTML for vehicle details
            const vehicleDetailHTML = await utilities.buildVehicleDetailView(vehicleData); 

            // Render the vehicle detail view
            res.render("inventory/vehicle-detail", {
                title: `${vehicleData.inv_make} ${vehicleData.inv_model}`, // Set the title
                vehicleDetailHTML,  // Pass the detailed HTML for vehicle
                nav
            });
        } else {
            // If no vehicle data is found, render a 404 error
            res.status(404).render('errors/error', {
                title: "Vehicle Not Found",
                message: "Sorry, that vehicle could not be found.",
                nav
            });
        }
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
};

/* ***************************
 *  Render the management view
 * ************************** */
invCont.managementView = async (req, res, next) => {
    try {
        const inventoryData = await invModel.getAllInventory(); // Fetch inventory data
        const classifications = await Classification.findAllClassifications(); // Fetch classifications
        const nav = await utilities.getNav(); // Fetch navigation links
        const messages = req.flash('notice'); // Retrieve flash messages

        // Render the management view
        res.render('inventory/management', {
            title: "Inventory Management",
            inventoryData, // Pass inventory data to the view
            classifications, // Pass classification data to the view
            nav, // Pass navigation data to the view
            messages // Pass flash messages to the view
        });
    } catch (error) {
        next(error); // Pass error to the error handler
    }
};

/* ***************************
 *  Render the add classification form
 * ************************** */
invCont.renderAddClassificationForm = (req, res, next) => {
    try {
        const view = utilities.buildAddClassificationView(); // Build the form view
        const messages = req.flash('notice'); // Retrieve flash messages

        res.render('inventory/add-classification', {
            title: "Add Classification",
            view, // Pass the built view
            messages // Pass flash messages to the view
        });
    } catch (error) {
        next(error); // Pass error to the error handler
    }
};

/* ***************************
 *  Add a new classification
 * ************************** */
invCont.addClassification = async (req, res, next) => {
    const { classification_name } = req.body; // Get classification name

    // Basic validation
    if (!classification_name || /\s/.test(classification_name) || /[^\w]/.test(classification_name)) {
        req.flash("notice", "Classification name cannot contain spaces or special characters.");
        return res.redirect("/inv/add-classification");
    }

    try {
        await invModel.addClassification(classification_name); // Add classification
        req.flash("notice", "Classification added successfully!");
        res.redirect("/inv");
    } catch (error) {
        next(error); // Pass error to the error handler
    }
};

/* ***************************
 *  Render the add vehicle form
 * ************************** */
invCont.renderAddVehicleForm = async (req, res, next) => {
    try {
        const nav = await utilities.getNav(); // Fetch navigation
        const classifications = await Classification.findAllClassifications(); // Fetch classifications
        const messages = [...req.flash('notice'), ...req.flash('error_notice')]; // Combine flash messages

        res.render("inventory/add-inventory", {
            title: "Add a New Vehicle",
            classifications,
            messages,  // Pass messages
            nav,  // Pass navigation
        });
    } catch (error) {
        req.flash('error_notice', 'Something went wrong. Please try again.');
        res.redirect("/error-page");
    }
};

/* ***************************
 *  Add a new vehicle
 * ************************** */
invCont.addVehicle = async (req, res, next) => {
    try {
        const {
            classificationId, // Ensure this is provided
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
        } = req.body;

        // Validate required fields
        if (!inv_make || !inv_model || !inv_year || !inv_price || !inv_miles || !inv_color || !classificationId) {
            req.flash('message', 'Please fill in all required fields.');
            return res.redirect('/inv/add-vehicle');
        }

        // Create new vehicle object
        const newVehicle = {
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classificationId, // Include classificationId
        };

        // Insert the new vehicle
        await invModel.addVehicle(newVehicle);
        req.flash('notice', 'Vehicle added successfully!');
        res.redirect('/inv/add-vehicle');
    } catch (error) {
        req.flash('error_notice', 'Failed to add vehicle.');
        res.redirect('/inv/add-vehicle');
    }
};

/* ***************************
 *  Simulate a server error
 * ************************** */
invCont.triggerServerError = async (req, res, next) => {
    try {
        throw new Error("This is a simulated server error");
    } catch (error) {
        next(error); // Pass error to the error handler
    }
};

module.exports = invCont;
