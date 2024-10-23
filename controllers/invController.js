const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);

  if (!data || data.length === 0) {
    req.flash("notice", "No vehicles found for this classification.");
    return res.redirect("/inv");
  }

  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build details by vehicleDetails view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.invId;
  const data = await invModel.getInventoryByInvId(inv_id);

  if (!data || data.length === 0) {
    req.flash("notice", "Vehicle not found.");
    return res.redirect("/inv");
  }

  const vehicle = data[0];
  const content = await utilities.buildInventoryDetails(vehicle);
  let nav = await utilities.getNav();
  const vehicleName = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;
  res.render("./inventory/vehicleDetails", {
    title: vehicleName,
    nav,
    content,
  });
};

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();
    let classificationSelect = await utilities.buildClassificationList();

    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildManagement:", error);
    next(error);
  }
};

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddView = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
};

/* ***************************
 *  Process add classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const classification_name = req.body.classification_name;
    await invModel.addClassification(classification_name);
    req.flash("notice", "Classification added successfully.");
    res.redirect("/inv");
  } catch (error) {
    console.error("Error adding classification:", error);
    req.flash("notice", "Failed to add classification.");
    res.redirect("/inv/add-classification");
  }
};

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInv = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationSelect = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationSelect,
    errors: null,
  });
};

/* ***************************
 *  Process add inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;

    await invModel.addInventory(
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    );

    req.flash("notice", "Vehicle added successfully.");
    res.redirect("/inv");
  } catch (error) {
    console.error("Error adding inventory:", error);
    req.flash("notice", "Failed to add vehicle.");
    res.redirect("/inv/add-inventory");
  }
};

/* ***************************
 *  Get inventory based on classification ID
 * ************************** */
invCont.getInventoryJSON = async function (req, res, next) {
  const classification_id = req.params.classification_id;

  try {
    const data = await invModel.getInventoryByClassificationId(classification_id);
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No vehicles found for this classification." });
    }
    return res.json(data); // Send JSON response
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = invCont;
