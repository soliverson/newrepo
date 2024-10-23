const Util = require('../utilities')
const utilities = require('../utilities')
const msgModel = require('../models/message-model')
const accountModel = require('../models/account-model')


/* ****************************************
*  Build add message view
* *************************************** */
async function buildAddMessage(req, res) {
    let nav = await utilities.getNav()
    const message_from = res.locals.accountData.account_id
    let recipientListSelect = await utilities.recipientListSelect(message_from, null)
    res.render("message/add-message", {
        nav,
        title: "New Message",
        errors: null,
        recipientListSelect,
        message_from,
    })
}

/* ****************************************
*  Build message management view
* *************************************** */
async function buildManagement(req, res) {
    let nav = await utilities.getNav()
    const name = `${res.locals.accountData.account_firstname} ${res.locals.accountData.account_lastname}`
    let msgTable = await utilities.getMsgTable(res.locals.accountData.account_id)
    res.render("message/management", {
        nav,
        title: `${name} Inbox`,
        errors: null,
        msgTable,
    })
}

/* ****************************************
*  Add Message
* *************************************** */
async function addMessage(req, res) {
    let nav = await utilities.getNav()
    const { message_from, message_to, message_subject, message_body, message_created } = req.body
    let recipientListSelect = await utilities.recipientListSelect(message_from, message_to)
    try {
        const result = await msgModel.addMessage(message_from, message_to, message_subject, message_body, message_created)
        if (!result) {
            req.flash("notice", "Adding message process failed")
            res.render("message/add-message", {
                nav,
                title: "New Message",
                errors: null,
                recipientListSelect,
                message_from,
                message_to,
                message_subject,
                message_body,
            })
        }
        req.flash("notice-success", "Message sent successfully")
        res.redirect("/message")
    } catch (error) {
        req.flash("notice", "Failed to send message.  Please try again.")
        res.render("message/add-message", {
            nav,
            title: "New Message",
            errors: null,
            recipientListSelect,
            message_from,
            message_to,
            message_subject,
            message_body,
            message_created,
        })
    }
}

/* ****************************************
*  Build Read Message View
* *************************************** */
async function buildReadMessage(req, res) {
    const message_id = req.params.message_id
    let nav = await utilities.getNav()
    const msgData = await msgModel.getMessageByMessage_id(message_id)
    if (!msgData) {
        req.flash("notice", "Unable to read message")
        res.redirect("/message/")
    }
    res.render(
        "message/read-message", {
        nav,
        errors: null,
        title: msgData.message_subject,
        subject: msgData.message_subject,
        sender_name: msgData.sender_name,
        content: msgData.message_body,
        message_to: msgData.message_to,
        message_id: msgData.message_id,
        message_read: msgData.message_read,
        message_archived: msgData.message_archived
        }
    )
}

/* ****************************************
*  Build Reply Message View
* *************************************** */
async function buildReplyMessage(req, res, next) {
    let nav = await utilities.getNav()
    const message_id = req.params.message_id
    const msgData = await msgModel.getMessageByMessage_id(message_id)
    if (!msgData) {
        req.flash("notice", "Unable to reply message")
        res.redirect(`/message/read/${message_id}`)
    }
    const sender_id = msgData.message_to
    const receiver_id = msgData.message_from
    const receiver_name = await accountModel.getFullNameByAccountId(receiver_id)
    const prevMsg_created = msgData.message_created
    const prevMsg_body = msgData.message_body

    res.render("message/reply-message", {
        nav,
        title: "Reply Message",
        errors: null,
        receiver_id,        // A reply to B
        receiver_name,      // A is sender
        sender_id,          // B is receiver
        message_subject: `RE: ${msgData.message_subject}`,
        message_body: `${receiver_name} (${prevMsg_created})\n${prevMsg_body}`,
    })
}

/* ****************************************
*  Reply Message
* *************************************** */
async function replyMessage(req, res) {
    /* A reply to B
    A is sender
    B is receiver */
    let nav = await utilities.getNav()
    const { message_from, message_to, message_subject, message_body, message_created } = req.body
    const receiver_id = message_to
    const receiver_name = await accountModel.getFullNameByAccountId(receiver_id)
    const sender_id = message_from
    try {
        const result = await msgModel.addMessage(message_from, message_to, message_subject, message_body, message_created)
        if (!result) {
            req.flash("notice", "Replying message process failed")
            res.render("message/reply-message", {
                nav,
                title: "Reply Message",
                errors: null,
                receiver_id,
                receiver_name,
                sender_id,
                message_subject,
                message_body,
            })
        }
        req.flash("notice-success", "Message sent successfully")
        res.redirect("/message")
    } catch (error) {
        req.flash("notice", "Failed to send message.  Please try again.")
        res.render("message/add-message", {
            nav,
            title: "New Message",
            errors: null,
            recipientListSelect,
            message_from,
            message_to,
            message_subject,
            message_body,
        })
    }
}

/* ****************************************
*  Mark-read
* *************************************** */
async function markRead(req, res) {
    const { message_id } = req.body
    try {
        const result = await msgModel.updateMessageRead(message_id)
        if (result) {
            req.flash("notice-success", "The message has been marked as read")
            res.redirect("/message")
        } else {
            req.flash("notice", "Unable to mark the message as read")
            res.redirect(`/message/read/${message_id}`)
        }
    } catch (error) {
        req.flash("notice", "Failed to mark the message as read")
        res.redirect(`/message`)
    }
}

/* ****************************************
*  Archive Message
* *************************************** */
async function archiveMessage(req, res) {
    const { message_id } = req.body
    try {
        const result = await msgModel.archiveMessage(message_id)
        if (result) {
            req.flash("notice-success", "The message has been archived successfully")
            res.redirect("/message")
        } else {
            req.flash("notice", "Unable to archive the message")
            res.redirect("/message")
        }
    } catch (error) {
        req.flash("notice", "Failed to archive the message")
        req.redirect(`/message/archive/${message_id}`)
    }
}

/* ****************************************
*  Build archived messages view
* *************************************** */
async function buildArchive(req, res, next) {
    let nav = await utilities.getNav()
    const account_name = `${res.locals.accountData.account_firstname} ${res.locals.accountData.account_lastname}`
    let archivedMsgTable = await utilities.getArchivedMsgTable(res.locals.accountData.account_id)
    
    res.render("message/archive-management", {
        nav,
        title: `${account_name} Archives`,
        archivedMsgTable,
        errors: null
    })
}

/* ****************************************
*  Delete Message
* *************************************** */
async function deleteMessage(req, res) {
    const { message_id } = req.body
    try {
        const result = await msgModel.deleteMessageByMsgId(message_id)
        if (result) {
            req.flash("notice-success", "You have deleted the message.")
            res.redirect("/message")
        } else {
            req.flash("notice", "Deleting message process failed.")
            res.redirect(`/message/read/${message_id}`)
        }
    } catch (error) {
        req.flash("notice", "Unable to delete message.  Please try later.")
        res.redirect(`/message/read/${message_id}`)
    }
}

module.exports = { buildAddMessage, buildManagement, addMessage, buildReadMessage, buildReplyMessage, replyMessage, markRead, archiveMessage, buildArchive, deleteMessage }