// Requirements
const invModel = require('../models/inventory-model');
const utilities = require('../utilities/');
const clasValidate = require('../utilities/classification-validation');

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  const className = data[0].classification_name;
  res.render('./inventory/classification', {
    title: className + ' vehicles',
    welcomeAccount,
    nav,
    grid,
  });
};

/**
 * Build specific inventory item by item ID
 */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inventoryId;
  const data = await invModel.getDetailByInventoryId(inv_id);
  const grid = await utilities.buildItemDetailGrid(data);
  let nav = await utilities.getNav();
  const welcomeAccount = await utilities.checkLoginWelcomeAccount(res);

  res.render('./inventory/detail', {
    title: data[0].inv_make + ' ' + data[0].inv_model + ' ' + data[0].inv_year,
    welcomeAccount,
    nav,
    grid,
  });
};

/**
 * Builds the inventory manager view
 */

invCont.buildInventoryManager = async function (req, res, next) {
  let nav = await utilities.getNav();
  const welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  const classificationSelect = await utilities.getClassificationOptions();
  res.render('./inventory/management', {
    title: 'Inventory Management',
    welcomeAccount,
    nav,
    classificationSelect,
    errors: null,
  });
};

/**
 * Builds the add classification view
 */

invCont.buildClassificationView = async function (req, res, next) {
  let nav = await utilities.getNav();
  const welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  res.render('./inventory/add-classification', {
    title: 'Add Classification',
    welcomeAccount,
    nav,
    errors: null,
  });
};

/**
 * adds the classification to the database and renders the inventory Management
 */
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;
  const classificationSelect = await utilities.getClassificationOptions();
  let nav;
  const welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  const classificationAddResult = await invModel.AddClassificationDB(
    classification_name
  );

  if (classificationAddResult) {
    nav = await utilities.getNav();
    req.flash(
      'notice',
      `You have successfully added ${classification_name} to the server!`
    );
    res.status(201).render('inventory/management', {
      title: 'Inventory Management',
      welcomeAccount,
      nav,
      classificationSelect,
      errors: null,
    });
  } else {
    nav = await utilities.getNav();
    req.flash('notice', "Sorry the classification wasn't added to the server");
    res.status(501).render('inventory/add-classification', {
      title: 'Add Classification',
      welcomeAccount,
      nav,
      errors: null,
    });
  }
};
/**
 * Builds the add inventory view
 */
invCont.buildAddInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav();
  const welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  let selection = await utilities.getClassificationOptions();
  res.render('./inventory/add-inventory', {
    title: 'Add To The Inventory',
    welcomeAccount,
    nav,
    selection,
    errors: null,
  });
};

/**
 * Adds the car to the inventory
 */
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  const classificationSelect = await utilities.getClassificationOptions();
  const {
    classification_id,
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

  const addInvResult = await invModel.addCarInventory(
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

  if (addInvResult) {
    req.flash(
      'notice',
      `The ${inv_make} ${inv_model} ${inv_year} has been added to the inventory`
    );
    res.status(201).render('inventory/management', {
      title: 'Inventory Management',
      welcomeAccount,
      nav,
      classificationSelect,
      errors: null,
    });
  } else {
    let selection = await utilities.getClassificationOptions(classification_id);
    req.flash('notice', "Sorry the car wasn't added to the inventory");
    res.status(501).render('inventory/add-inventory', {
      title: 'Add Inventory',
      welcomeAccount,
      nav,
      selection,
      errors: null,
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error('No data returned'));
  }
};

/**
 * This builds the edit inventory view
 */

invCont.buildInventoryEditView = async function (req, res, next) {
  let nav = await utilities.getNav();
  const welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  const inv_id = parseInt(req.params.inventory_id);
  const itemData = await invModel.getDetailByInventoryId(inv_id);
  let classificationSelect = await utilities.getClassificationOptions(
    itemData[0].classification_id
  );
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`;
  res.render('./inventory/edit-inventory', {
    title: 'Edit ' + itemName,
    welcomeAccount,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_description: itemData[0].inv_description,
    inv_image: itemData[0].inv_image,
    inv_thumbnail: itemData[0].inv_thumbnail,
    inv_price: itemData[0].inv_price,
    inv_miles: itemData[0].inv_miles,
    inv_color: itemData[0].inv_color,
    classification_id: itemData[0].classification_id,
  });
};

/**
 * Updates an inventory item
 */
invCont.updateInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const welcomeAccount = await utilities.checkLoginWelcomeAccount(res);

  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    inv_id,
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_id,
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

  if (updateResult) {
    const itemName = updateResult.inv_make + ' ' + updateResult.inv_model;
    req.flash('notice', `The ${itemName} has been successfully updated.`);
    res.redirect('/inv/');
  } else {
    const classificationSelect = await utilities.getClassificationOptions(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash('notice', 'Sorry the the insert failed');
    res.status(501).render('inventory/edit-inventory', {
      title: 'Edit ' + itemName,
      welcomeAccount,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
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
    });
  }
};

/**
 * Build delete inventory view
 */
invCont.buildDeleteView = async function (req, res, next) {
  let nav = await utilities.getNav();
  const welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  const inventory_id = parseInt(req.params.inventory_id);
  const itemData = await invModel.getDetailByInventoryId(inventory_id);
  const { inv_id, inv_make, inv_model, inv_year, inv_price } = itemData[0];
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`;
  res.render('./inventory/delete-confirm', {
    title: 'Delete ' + itemName,
    welcomeAccount,
    nav,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
  });
};

/**
 * deletes an inventory item
 */
invCont.deleteInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const welcomeAccount = await utilities.checkLoginWelcomeAccount(res);
  const { inv_make, inv_model, inv_year, inv_price, inv_id } = req.body;
  const updateResult = await invModel.deleteFromInventory(inv_id);

  if (updateResult) {
    const itemName = inv_make + ' ' + inv_model;
    req.flash('notice', `The ${itemName} has been successfully deleted.`);
    res.redirect('/inv/');
  } else {
    const itemName = `${inv_make} ${inv_model}`;
    req.flash('notice', 'Sorry the the delete failed');
    res.status(501).render('inventory/delete-confirm', {
      title: 'Delete ' + itemName,
      welcomeAccount,
      nav,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
    });
  }
};

module.exports = invCont;