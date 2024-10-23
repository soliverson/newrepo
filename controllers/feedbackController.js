const utilities = require('../utilities');
const feedbackModel = require('../models/feedback-model');

async function submitFeedback(req, res) {
    const { feedback_name, feedback_email, comments, rating } = req.body; // Ensure correct field names
    const user_id = req.user.account_id; // Assuming user ID is available from session

    try {
        await feedbackModel.addFeedback(user_id, comments, rating);
        req.flash("notice", "Feedback submitted successfully.");
        res.redirect("/account");
    } catch (error) {
        console.error("Error submitting feedback:", error);
        req.flash("error", "Failed to submit feedback. Please try again.");
        res.redirect("/feedback");
    }
}

async function feedbackPage(req, res) {
    console.log("Feedback page accessed");
    let nav = await utilities.getNav();
    res.render("feedback/feedback-submit", { nav });
}

module.exports = { submitFeedback, feedbackPage };
