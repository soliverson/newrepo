const pool = require("../database")

/* ***************************
 *  Add message
 * ************************** */
async function addMessage(message_from, message_to, message_subject, message_body, message_created ) {
    try {
        const sql = "INSERT INTO message (message_from, message_to, message_subject, message_body, message_created) VALUES ($1, $2, $3, $4, $5)"
        const result = await pool.query(sql, [message_from, message_to, message_subject, message_body, message_created])
        return result.rowCount
    } catch (error) {
        throw new Error("Failed to create new message")
    }
}

/* ***************************
 *  Get unread message by Receiver
 * ************************** */
async function getUnreadMsgByMessage_to(message_to) {
    try {
        const sql = "SELECT * FROM message JOIN account ON message.message_from = account.account_id WHERE message_archived = FALSE AND message_read = FALSE AND message_to = $1"
        const result = await pool.query(sql, [message_to])
        return result.rows
    } catch (error) {
        throw new Error("Failed to retrieve messages.")
    }
}

/* ***************************
 *  Get message by Receiver
 * ************************** */
async function getMessagesByMessage_to(message_to) {
    try {    
        const sql = "SELECT message_id, message_created, message_subject, message_body, message_read, message_archived, account_firstname || ' ' || account_lastname AS sender_name FROM message JOIN account ON message.message_from = account.account_id WHERE message_archived = FALSE AND message_to = $1 ORDER BY message_read ASC"
        const result = await pool.query(sql, [message_to])
        return result.rows
    } catch (error) {
        throw new Error("Failed to retrieve messages")
    }
}

/* ***************************
 *  Get message by Message ID
 * ************************** */
async function getMessageByMessage_id(message_id) {
    try {
        const sql = "SELECT message_id, message_subject, message_body, message_from, message_to, message_created, message_read, message_archived, account_firstname || ' ' || account_lastname AS sender_name FROM message JOIN account ON message_from = account_id WHERE message_id = $1"
        const result = await pool.query(sql, [message_id])
        return result.rows[0]
    } catch (error) {
        throw new Error("Failed to retrieve the message")
    }
}

/* ***************************
 *  Update message_read by message_id
 * ************************** */
async function updateMessageRead(message_id) {
    try {
        const sql = "UPDATE message SET message_read = TRUE WHERE message_id = $1"
        const result = await pool.query(sql, [message_id])
        return result.rowCount
    } catch (error) {
        throw new Error("Failed to update message_read")
    }
}

/* ***************************
 *  Archive message_read by message_id
 * ************************** */
async function archiveMessage(message_id) {
    try {
        const sql = "UPDATE message SET message_archived = TRUE WHERE message_id = $1"
        const result = await pool.query(sql, [message_id])
        return result.rowCount
    } catch (error) {
        throw new Error("Failed to update message_archive")
    }
}

/* ***************************
 *  Get archived messages by message_to
 * ************************** */
async function getArchivedMsgByFrom(message_to) {
    try {
        const sql = "SELECT * from message WHERE message_to = $1 AND message_archived = TRUE"
        const result = await pool.query(sql, [message_to])
        
        return result.rows
    } catch (error) {
        throw new Error("Failed to get archived messages")
    }
}

/* ***************************
 *  Delete messages by message_id
 * ************************** */
async function deleteMessageByMsgId(message_id) {
    try {
        const sql = "DELETE FROM message WHERE message_id = $1"
        const result = await pool.query(sql, [message_id])
        return result.rowCount
    } catch (error) {
        throw new Error("Failed to delete message")
    }
}

module.exports = { addMessage, getUnreadMsgByMessage_to, getMessagesByMessage_to, getMessageByMessage_id, updateMessageRead, archiveMessage, getArchivedMsgByFrom, deleteMessageByMsgId }