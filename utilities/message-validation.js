const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")

/*  **********************************
*  Add-message Rules
* ********************************* */
validate.addMsgRules = () => {
    return [
        body("message_from")
        .trim()
        .escape()
        .notEmpty().withMessage("Can't retrieve your identity"),

        body("message_to")
        .trim()
        .escape()
        .notEmpty().withMessage("Choose a recipient"),

        body("message_subject")
        .trim()
        .escape()
        .notEmpty().withMessage("Subject is required"),

        body("message_body")
        .trim()
        .notEmpty().withMessage("Message content is required")
        .isLength({min: 2}).withMessage("At least 2 characters in message content"),
    ]
}


validate.checkAddMsg = async(req, res, next) => {
    const { message_from, message_to, message_subject, message_body } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let recipientListSelect = await utilities.recipientListSelect(message_from, message_to)
        res.render("message/add-message", {
            nav,
            title: "New Message",
            errors,
            recipientListSelect,
            message_from,
            message_subject,
            message_body,
        })
        return
    }
    next()
}

validate.replyMsgRules = () => {
    return [
        body("message_subject")
        .trim()
        .escape()
        .notEmpty().withMessage("Subject is required"),

        body("message_body")
        .trim()
        .escape()
        .notEmpty().withMessage("Message content is required")
        .isLength({min: 2}).withMessage("At least 2 characters in message content"),

        body("message_from")
        .trim()
        .escape()
        .notEmpty(),

        body("message_from")
        .trim()
        .escape()
        .notEmpty()
    ]
}

validate.checkReplyMsg = async(req, res, next) => {
    const { message_subject, message_body, message_to, message_from } = req.body
    const receiver_id = message_to
    const receiver_name = await accountModel.getFullNameByAccountId(receiver_id)
    const sender_id = message_from

    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        
        res.render("message/reply-message", {
            nav,
            title: "Reply Message",
            errors,
            receiver_id,
            receiver_name,
            sender_id,
            message_subject,
            message_body,
        })
        return
    }
    next()
}
module.exports = validate