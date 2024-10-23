const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const feedbackValidate = require('../utilities/feedback-validation');

// Submit feedback route
router.post('/submit', 
    feedbackValidate.feedbackRules(),
    feedbackValidate.checkFeedbackData,
    feedbackController.submitFeedback
);

// Render feedback page
router.get('/', feedbackController.feedbackPage);

module.exports = router;
