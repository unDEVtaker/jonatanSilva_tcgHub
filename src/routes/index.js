const express = require('express');
const { index } = require('../controllers/indexController.js');
const { shop } = require('../controllers/productsController.js');

const router = express.Router();


router
    .get('/', index)
    .get('/shop', shop)


module.exports = router;