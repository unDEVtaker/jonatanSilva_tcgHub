const express = require('express');
const router = express.Router();
const productsController = require('../controllers/indexController.js');
const indexController = require('../controllers/indexController');


router
  .get('/', indexController.home)
  .get('/shop', (req, res) => {
    const set = req.query.set || null;
    res.render('shop', { title: 'Shop - TCG HUB', user: req.session.user, set });
  });



module.exports = router;