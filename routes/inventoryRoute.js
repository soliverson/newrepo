const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const invValidate = require("../utilities/inventory-validation");

/* *************
 * Build View
 ************* */
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

router.get("/error", utilities.handleErrors(invController.buildError));

// Route to display the edit inventory view for a specific item
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView));

router.get("/delete/:inv_id", utilities.handleErrors(invController.deleteInvView));

router.get("/", 
    utilities.checkLogin, 
    utilities.checkAuthZ,
    async (req, res, next) => {
        try {
            await invController.buildManagement(req, res, next);
        } catch (error) {
            console.error("Error in buildManagement:", error);
            next(error);
        }
    }
);

router.get("/add-classification", utilities.handleErrors(invController.buildAddView));

router.get("/add-inventory", utilities.handleErrors(invController.buildAddInv));

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

/* *************
 * Process View
 ************* */
router.post(
    "/add-classification", 
    invValidate.classificationRules(),
    invValidate.checkClassificationName,
    utilities.handleErrors(invController.addClassification)
);

router.post(
    "/add-inventory",
    invValidate.invRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
);

router.post(
    "/update/",
    invValidate.invRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
);

router.post(
    "/delete/",
    utilities.handleErrors(invController.deleteInventory)
);

module.exports = router;
