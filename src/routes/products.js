'use strict';
const express = require('express');
const router = express.Router();

// Middleware y otros requires
const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require("uuid");


const productsControllers = require('../controllers/productsController'); // Cambiar el nombre para que coincida con la exportación



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'public', 'images', 'products'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = path.basename(file.originalname, path.extname(file.originalname)) + "-" + Date.now() + "-" + uuidv4() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpg|jpeg|png|gif)$/i;
  if (allowedExtensions.test(file.originalname)) {
    cb(null, true);
  } else {
    req.fileValidationError = 'Solo se permiten archivos de imagen (jpg, jpeg, png, gif).';
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });


const productValidations = [
  body('name')
    .notEmpty().withMessage('El nombre del producto es obligatorio').bail()
    .isLength({ min: 1 }).withMessage('El nombre debe tener al menos 1 caracter'), // <--- Cambiado a min: 1
  body('description')
    .notEmpty().withMessage('La descripción es obligatoria').bail()
    .isLength({ min: 20 }).withMessage('La descripción debe tener al menos 20 caracteres'),
  body('price')
    .notEmpty().withMessage('El precio es obligatorio').bail()
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a cero.'),
  body('stock')
    .notEmpty().withMessage('El stock es obligatorio').bail()
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero no negativo.'),
];



router.get('/', productsControllers.index);
router.get('/detail/:id', productsControllers.detail);
router.get('/sproduct/:api_id', productsControllers.sproduct);
router.get('/shop', productsControllers.shop);

router.get('/api/list', productsControllers.apiList);

router.get('/admin', authMiddleware, productsControllers.productsAdmin);
router.get('/add', authMiddleware, productsControllers.add);

router.post('/create', authMiddleware, productValidations, productsControllers.create); // Sin el middleware de Multer

router.get('/edit/:id', authMiddleware, productsControllers.edit);
router.put('/edit/:id', authMiddleware, upload.array('productImages', 5), productValidations, productsControllers.update);

router.delete('/delete/:id', authMiddleware, productsControllers.delete); // Usar DELETE


module.exports = router;