const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController.js');
//const authMiddleware = require('../middleware/authMiddleware'); // No se usa en este archivo

router
  .get('/', indexController.index)
  .get('/shop', (req, res) => { // Agregado para que funcione
    res.render('shop', { title: 'Shop - TCG HUB', user: req.session.user });
  });


module.exports = router;