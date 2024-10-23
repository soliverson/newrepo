const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const msgController = require("../controllers/messageController")
const msgValidate = require("../utilities/message-validation")

/* ***********************
* Build add message View
*********************** */
router.get("/add-message",
    utilities.checkLogin,
    utilities.handleErrors(msgController.buildAddMessage)
)

/* ****************************
* Build message management View
**************************** */
router.get("/",
    utilities.checkLogin,
    utilities.handleErrors(msgController.buildManagement)
)

/* ****************************
* Process Add Message
**************************** */
router.post("/add-message", 
    utilities.checkLogin,
    msgValidate.addMsgRules(),
    msgValidate.checkAddMsg,
    utilities.handleErrors(msgController.addMessage)
)

/* ****************************
* Build read-Message
**************************** */
router.get("/read/:message_id", 
    utilities.checkLogin,
    utilities.handleErrors(msgController.buildReadMessage)
)

/* ****************************
* Build reply-Message
**************************** */
router.get("/reply/:message_id",
    utilities.checkLogin,
    utilities.handleErrors(msgController.buildReplyMessage)
)

/* ****************************
* Process reply-Message
**************************** */
router.post("/reply-message",
    utilities.checkLogin,
    msgValidate.replyMsgRules(),
    msgValidate.checkReplyMsg,
    utilities.handleErrors(msgController.replyMessage)
)

/* ****************************
* Process mark-read
**************************** */
router.post("/mark-read",
    utilities.checkLogin,
    utilities.handleErrors(msgController.markRead)
)

/* ****************************
* Process archive message
**************************** */
router.post("/archive",
    utilities.checkLogin,
    utilities.handleErrors(msgController.archiveMessage)
)

/* ****************************
* Process archive management
**************************** */
router.get("/archive",
    utilities.checkLogin,
    utilities.handleErrors(msgController.buildArchive)
)

/* ****************************
* Process delete message
**************************** */
router.post("/delete", 
    utilities.checkLogin,
    utilities.handleErrors(msgController.deleteMessage)
)

module.exports = router