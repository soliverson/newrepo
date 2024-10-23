const utilities = require(".")
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.classificationRules = () => {
    return [
        body("classification_name")
        .trim()
        .escape()
        .notEmpty().withMessage("New classification name is required.")
        .isLength({min: 1}).withMessage("Enter at least one character.")
        .isAlpha().withMessage("Only alphabetic letters are allowed.")
        .custom(async(classification_name) => {
            const nameExists = await invModel.checkExistingName(classification_name)
            if (nameExists) {
                throw new Error("Classification name already exists.")
            }
        })
    ]
}

validate.checkClassificationName = async(req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            nav,
            title: "Add New Classification",
            errors,
            classification_name
        })
        return
    }
    next()
}


/*  **********************************
*  Inventory Data Validation Rules
* ********************************* */
validate.invRules = () => {
    const thisYear = new Date().getFullYear()
    return [
        body("classification_id")
        .notEmpty().withMessage("Choose a classification")
        .isInt().withMessage("Invalid classification"),

        body("inv_make")
        .trim()
        .escape()
        .notEmpty().withMessage("Make is required")
        .isLength({min: 3}).withMessage("At least 3 characters in make"),

        body("inv_model")
        .trim()
        .escape()
        .notEmpty().withMessage("Model is required.")
        .isLength({min: 3}).withMessage("At least 3 characters in model"),

        body("inv_year")
        .notEmpty().withMessage("Year is required")
        .isInt({min: 1000, max: thisYear}).withMessage("Enter a valid year"),

        body("inv_description")
        .trim()
        .escape()
        .notEmpty().withMessage("Description is required"),

        body("inv_image")
        .trim()
        .notEmpty().withMessage("Image path is required."),

        body("inv_thumbnail")
        .trim()
        .notEmpty().withMessage("Thumbnail image path is required"),

        body("inv_price")
        .notEmpty().withMessage("Price is required.")
        .isFloat({min: 0}).withMessage("Enter price in decimal or integer."),

        body("inv_miles")
        .notEmpty().withMessage("Miles is required")
        .isFloat({min: 0, max: 999999999}).withMessage("Enter digits only"),

        body("inv_color")
        .trim()
        .escape()
        .notEmpty().withMessage("Color is required")
        
    ]
}

/* ******************************
* Check data and return errors or continue to add inventory
* ***************************** */
validate.checkInventoryData = async(req, res, next) => {
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
        classification_id
    } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationSelect = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            nav,
            title: "Add New Vehicle",
            classificationSelect,
            errors,
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
        })
        return
    }
    next()
}


/* ******************************
* Check data and return errors or continue to update inventory
* ***************************** */
validate.checkUpdateData = async(req, res, next) => {
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
        inv_id
    } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationSelect = await utilities.buildClassificationList(classification_id)
        let vehicle = `${inv_make} ${inv_model}`
        res.render("inventory/edit-inventory", {
            nav,
            title: `Edit ${vehicle}`,
            classificationSelect,
            errors,
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
            inv_id
        })
        return
    }
    next()
}

module.exports = validate