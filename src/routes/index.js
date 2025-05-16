const express = require('express');
const router = express.Router();
const productsController = require('../controllers/indexController.js');
const indexController = require('../controllers/indexController');
//const authMiddleware = require('../middleware/authMiddleware'); // No se usa en este archivo

router
  .get('/', indexController.home) // Asumimos que esta ruta debe mostrar la página principal
  .get('/shop', (req, res) => {
    const set = req.query.set || null;
    res.render('shop', { title: 'Shop - TCG HUB', user: req.session.user, set });
  });

// Aquí podrías tener más definiciones de rutas

module.exports = router;