var express = require('express');
var router = express.Router();
/* GET home page. */
const sproductController = require('../controllers/sproductController')

router.get('/', sproductController.index);

module.exports = router;