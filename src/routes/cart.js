var express = require('express');
var router = express.Router();
/* GET home page. */
const cartController = require('../controllers/cartController')

router.get('/', cartController.index);

module.exports = router;