const utilities = require('../utilities');
const express = require('express');
const router = new express.Router();
const internalErrorController = require('../controllers/intentionalErrorController');

router.get(
  '/interror/:errorId',
  utilities.handleErrors(internalErrorController.faultyFunction)
);

module.export = router;