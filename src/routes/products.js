// routes/products.js
const express = require('express');
const { list, sproduct, shop, productsAdmin,detail,edit,update, remove, create, add } = require('../controllers/productsController.js');

const router = express.Router();

router
    .get('/', list)
    .get('/detail/:id', detail)
    .get('/sproduct/:id', sproduct)
    .get('/shop', shop)
    //crud
    .get('/admin', productsAdmin)
    .get('/detail/:id', detail)
    .get('/delete/:id', remove)
    .get('/edit/:id', edit)
    .post('/edit/:id', update)
    .get('/add', add) // Muestra el formulario
    .post('/create', create); // Procesa el formulario
module.exports = router;