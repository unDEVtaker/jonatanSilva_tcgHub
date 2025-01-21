var express = require('express');
var router = express.Router();
/* GET home page. */
const loginController = require('../controllers/loginController')

router.get('/', loginController.index);

module.exports = router;