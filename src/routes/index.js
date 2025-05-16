const express = require('express');
const router = express.Router();
const productsController = require('../controllers/indexController.js');
const indexController = require('../controllers/indexController');
//const authMiddleware = require('../middleware/authMiddleware'); // No se usa en este archivo

router
  .get('/', indexController.home) // Asumimos que esta ruta debe mostrar la página principal
  .get('/shop', (req, res) => { // Esta es una ruta correcta con req y res
    res.render('shop', { title: 'Shop - TCG HUB', user: req.session.user, products: limitedProducts });
  });

// Aquí podrías tener más definiciones de rutas

module.exports = router;