const { body, validationResult } = require("express-validator");
const validate = {};

// Validation rules for feedback submission
validate.feedbackRules = () => {
    return [
        body("feedback_name")
            .trim()
            .notEmpty().withMessage("Your name is required."),
        body("feedback_email")
            .isEmail().withMessage("Email format is not correct.")
            .notEmpty().withMessage("Email is required."),
        body("comments")
            .trim()
            .notEmpty().withMessage("Comments are required.")
            .isLength({ min: 5 }).withMessage("Comments must be at least 5 characters long."),
        body("rating")
            .isInt({ min: 1, max: 5 }).withMessage("Rating must be an integer between 1 and 5.")
            .notEmpty().withMessage("Rating is required."),
    ];
};

// Check feedback data for errors
validate.checkFeedbackData = async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        return res.render("feedback/feedback-submit", {
            errors,
            title: "Submit Feedback",
            nav,
        });
    }
    next();
};

module.exports = validate;
