'use strict';
const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const guestMiddleware = require('../middleware/guestMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const registerValidations = require('../middleware/registerValidations');

const db = require('../database/models/index');
const models = db.models;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // --- RUTA DE DESTINO CORREGIDA ---
        // Desde src/routes, sube dos niveles (../../) para llegar a la raíz del proyecto,
        // luego entra en public/images/users
        cb(null, path.join(__dirname, '..', '..', 'public', 'images', 'users')); // <<-- Usa esta línea
    },
    filename: function (req, file, cb) {
        // ... (este código se mantiene igual) ...
        const { v4: uuidv4 } = require("uuid");
        const uniqueSuffix = path.basename(file.originalname, path.extname(file.originalname)) + "-" + Date.now() + "-" + uuidv4() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    },
});

const fileFilter = (req, file, cb) => {
    const filtro = /\.(jpg|jpeg|png|gif)$/;
    if (filtro.test(file.originalname)) {
        cb(null, true);
    } else {
        req.errorValidationImage = "No es un tipo de archivo valido";
        cb(null, false);
    }
};
const upload = multer({ storage, fileFilter });

const loginValidations = [
    body('correo').isEmail().withMessage('El correo debe ser válido'),
    body('contrasena').notEmpty().withMessage('La contraseña es obligatoria'),
];

router.get("/signup", guestMiddleware, usersController.signup);
router.post("/signup", registerValidations, usersController.store);

router.get("/login", guestMiddleware, usersController.login);
router.post("/login", loginValidations, usersController.processLogin);

router.get("/profile/:id", usersController.profile);
router.put("/profile/:id", authMiddleware, upload.single("avatar"), usersController.updateProfile);

//router.post("/delete/:id", authMiddleware, usersController.deleteUser);

router.post("/logout", usersController.logout);

module.exports = router;