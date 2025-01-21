var express = require('express');
var router = express.Router();
/* GET home page. */
const singupController = require('../controllers/singupController')

router.get('/', singupController.index);

module.exports = router;