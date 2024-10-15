const pool = require('../database'); // Import the database connection

/* *****************************
*   Check if email already exists
* *************************** */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);
    return result.rowCount > 0; // Returns true if the email exists
  } catch (error) {
    console.error("Error checking email existence:", error);
    throw error; // Re-throw the error for handling in the controller
  }
}

/* *****************************
*   Register a new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
                 VALUES ($1, $2, $3, $4, 'Client') RETURNING *`;
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    return result.rows[0]; // Return the newly registered account details
  } catch (error) {
    console.error("Error registering account:", error);
    throw error; // Re-throw the error for handling in the controller
  }
}

module.exports = {
  checkExistingEmail,
  registerAccount
};
