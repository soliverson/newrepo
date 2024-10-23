const pool = require("../database");

// Add feedback
async function addFeedback(user_id, comments, rating) {
    const sql = "INSERT INTO feedback (user_id, comments, rating) VALUES ($1, $2, $3) RETURNING feedback_id";
    const result = await pool.query(sql, [user_id, comments, rating]);
    return result.rows[0].feedback_id;
}

// Get feedback by user ID
async function getFeedbackByUserId(user_id) {
    const sql = "SELECT * FROM feedback WHERE user_id = $1 ORDER BY created_at DESC";
    const result = await pool.query(sql, [user_id]);
    return result.rows;
}

module.exports = { addFeedback, getFeedbackByUserId };
