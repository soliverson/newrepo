const pool = require("../database");

/* ***************************
 *  Add feedback to the database
 * ************************** */
async function addFeedback(user_id, comments, rating) {
    try {
        const sql = "INSERT INTO feedback (user_id, comments, rating) VALUES ($1, $2, $3)";
        await pool.query(sql, [user_id, comments, rating]);
    } catch (error) {
        console.error("Error adding feedback:", error);
        throw error;
    }
}

/* ***************************
 *  Get all feedback
 * ************************** */
async function getAllFeedback() {
    const sql = "SELECT * FROM feedback ORDER BY created_at DESC";
    const result = await pool.query(sql);
    return result.rows; // Return all feedback rows
}

module.exports = {
    addFeedback,
    getAllFeedback,
};
