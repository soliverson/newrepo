const pool = require("../database");

/* ***************************
 *  Register a new account
 * ************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = "INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password) VALUES ($1, $2, $3, $4)";
        await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
        return true; // Registration successful
    } catch (error) {
        console.error("Failed to register account:", error);
        throw error; // Throw the error to be handled at a higher level
    }
}

/* ***************************
 *  Get account by email
 * ************************** */
async function getAccountByEmail(account_email) {
    try {
        const sql = "SELECT * FROM public.account WHERE account_email = $1";
        const result = await pool.query(sql, [account_email]);
        return result.rows[0]; // Return the first account found
    } catch (error) {
        console.error("Error fetching account by email:", error);
        throw error; // Throw the error to be handled at a higher level
    }
}

/* ***************************
 *  Get account by ID
 * ************************** */
async function getAccountById(account_id) {
    try {
        const sql = "SELECT * FROM public.account WHERE account_id = $1";
        const result = await pool.query(sql, [account_id]);
        return result.rows[0]; // Return the first account found
    } catch (error) {
        console.error("Error fetching account by ID:", error);
        throw error; // Throw the error to be handled at a higher level
    }
}

/* ***************************
 *  Check if an email already exists
 * ************************** */
async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT * FROM public.account WHERE account_email = $1";
        const result = await pool.query(sql, [account_email]);
        return result.rows.length > 0; // Return true if email exists, false otherwise
    } catch (error) {
        console.error("Error checking existing email:", error);
        throw error;
    }
}

/* ***************************
 *  Update account information
 * ************************** */
async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
    try {
        const sql = "UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4";
        await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
    } catch (error) {
        console.error("Error updating account:", error);
        throw error; // Throw the error to be handled at a higher level
    }
}

/* ***************************
 *  Delete account
 * ************************** */
async function deleteAccount(account_id) {
    try {
        const sql = "DELETE FROM public.account WHERE account_id = $1";
        await pool.query(sql, [account_id]);
    } catch (error) {
        console.error("Error deleting account:", error);
        throw error; // Throw the error to be handled at a higher level
    }
}

/* Export all functions */
module.exports = {
    registerAccount,
    getAccountByEmail,
    getAccountById,
    checkExistingEmail,  // Now included in the export
    updateAccount,
    deleteAccount,
};
