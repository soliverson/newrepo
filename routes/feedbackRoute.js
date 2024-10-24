const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const feedbackValidate = require('../utilities/feedback-validation');
const checkAuth = require('../utilities/checkAuth'); // Middleware to check if the user is logged in

// Render feedback submission page (only if logged in)
router.get('/', checkAuth, feedbackController.feedbackPage);

// Submit feedback route (with validation, only if logged in)
router.post('/submit', 
    checkAuth, // Ensure user is logged in
    feedbackValidate.feedbackRules(), // Validation for feedback
    feedbackValidate.checkFeedbackData, // Handle validation errors
    feedbackController.submitFeedback // Handle submission
);

// View all feedback (only if logged in)
router.get('/view', checkAuth, feedbackController.viewFeedback);

module.exports = router;
