var express = require('express');
var router = express.Router();
/* GET home page. */
const productAdd = require('../controllers/productAddController')

router.get('/', productAdd.index);
router.post('/', productAdd.create);

module.exports = router;