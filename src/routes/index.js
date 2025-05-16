const express = require('express');
const router = express.Router();
const productsController = require('../controllers/indexController.js');
const indexController = require('../controllers/indexController');
const authMiddleware = require('../middleware/authMiddleware');


router
  .get('/', indexController.home)
  .get('/shop', (req, res) => {
    const set = req.query.set || null;
    res.render('shop', { title: 'Shop - TCG HUB', user: req.session.user, set });
  })
  // Ruta del carrito
  .get('/cart', authMiddleware, (req, res) => {
    res.render('cart', { title: 'Carrito - TCG HUB' });
  });



module.exports = router;