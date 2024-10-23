const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);

  // Check if data exists
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

  // Check if vehicle data exists
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

invCont.buildError = async function (req, res, next) {
  const inv_id = 100;
  const data = await invModel.getInventoryByInvId(inv_id);

  if (!data || data.length === 0) {
    req.flash("notice", "Error fetching vehicle data.");
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
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  try {
    const itemData = await invModel.getInventoryByInvId(inv_id);
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
    });
  } catch (error) {
    console.error("Error in editInventoryView:", error);
    next(error);
  }
};



module.exports = invCont;
