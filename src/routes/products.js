const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController.js');
console.log('Contenido de productsController:', productsController); // Agrega esta línea
const authMiddleware = require('../middleware/authMiddleware');


router
    .get('/', productsController.list)
    .get('/detail/:id', productsController.ecommerceDetail)
    .get('/sproduct/:id', productsController.sproduct)
    .get('/shop', productsController.shop)
    //crud
    .get('/admin', authMiddleware, productsController.productsAdmin) // Protegida y modificada
    .get('/delete/:id', authMiddleware, productsController.remove)
    .get('/edit/:id', authMiddleware, productsController.edit)
    .post('/edit/:id', authMiddleware, productsController.update)
    .get('/add', authMiddleware, productsController.add) // Muestra el formulario, protegida
    .post('/create', authMiddleware, productsController.create); // Procesa el formulario, protegida

module.exports = router;
