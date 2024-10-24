const feedbackModel = require('../models/feedback-model');
const utilities = require('../utilities');

// Handle feedback submission
async function submitFeedback(req, res) {
    const { comments, rating } = req.body;
    const user_id = req.user.account_id; // Get user ID from session

    try {
        await feedbackModel.addFeedback(user_id, comments, rating); // Insert feedback into the database
        req.flash("notice", "Feedback submitted successfully.");
        res.redirect("/feedback"); // Redirect back to the feedback page after submission
    } catch (error) {
        console.error("Error submitting feedback:", error);
        req.flash("error", "Failed to submit feedback. Please try again.");
        res.redirect("/feedback");
    }
}

// Render feedback submission page
async function feedbackPage(req, res) {
    let nav = await utilities.getNav();
    res.render("feedback/feedback-submit", { 
        nav, 
        title: "Submit Feedback",
        errors: null // Pass errors as null when loading the page
    });
}

// View all feedback
async function viewFeedback(req, res) {
    try {
        const feedbacks = await feedbackModel.getAllFeedback(); // Fetch feedback from the database
        let nav = await utilities.getNav();
        res.render("feedback/feedback-view", {
            title: "Feedback Received",
            nav,
            feedbacks
        });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        req.flash("error", "Failed to retrieve feedback.");
        res.redirect('/');
    }
}

module.exports = { submitFeedback, feedbackPage, viewFeedback };
