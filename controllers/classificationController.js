const Classification = require("../models/classification-model");

const classificationController = {
    // Fetch all classifications
    async getClassifications(req, res) {
        try {
            const classifications = await Classification.findAllClassifications();
            res.render("your-view-file", {
                classifications,
                messages: req.flash('message') // Pass flash messages to view
            });
        } catch (error) {
            console.error("Error fetching classifications: ", error);
            res.status(500).send("Error fetching classifications");
        }
    },

    // Add a new classification
    async addClassification(req, res) {
        const classificationName = req.body.classification_name.trim(); // Trim spaces

        // Check if classification name is valid
        if (!classificationName) {
            req.flash('message', 'Classification name cannot be empty.');
            return res.redirect('/classification/add');
        }

        try {
            const newClassification = await Classification.addClassification(classificationName);
            // Flash success message
            req.flash('message', 'Classification added successfully!');
            // Redirect to the add vehicle form
            res.redirect('/inv/add-vehicle'); // Adjust the path based on your routing setup
        } catch (error) {
            console.error("Error adding classification: ", error);
            req.flash('message', 'Error adding classification. Please try again.');
            // Redirect back to add classification page
            res.redirect('/classification/add');
        }
    }
};

module.exports = classificationController;
