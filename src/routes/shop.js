var express = require('express');
var router = express.Router();
/* GET home page. */
const shopController = require('../controllers/shopController')

router.get('/', shopController.index);

module.exports = router;