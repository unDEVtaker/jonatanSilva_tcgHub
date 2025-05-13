// routes/users.js

const express = require("express");
const router = express.Router();
const usersControllers = require("../controllers/usersController"); // Asegúrate de que esta ruta sea correcta
const { body } = require("express-validator");
const multer = require("multer");
const path = require("path");
const guestMiddleware = require('../middleware/guestMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// ... Configuración de Multer ...
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,path.join(__dirname,'../public/images/users'));
    },
    filename: function (req, file, cb) {
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


// ... Validaciones ...
const registerValidations = [
    body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    body("correo").isEmail().withMessage("El correo debe ser válido"),
    body("contrasena").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
];
const loginValidations = [
    body("correo").isEmail().withMessage("El correo debe ser válido"),
    body("contrasena").notEmpty().withMessage("La contraseña es obligatoria"),
];


// --- Rutas ---
// Rutas de Registro
router.get("/signup", guestMiddleware, usersControllers.signup);
router.post("/signup", registerValidations, usersControllers.store);

// Rutas de Login
router.get("/login", guestMiddleware, usersControllers.login);
router.post("/login", loginValidations, usersControllers.processLogin);

// Rutas de Perfil (Ahora la GET está activa)
router.get("/profile/:id", usersControllers.profile); // <-- DESCOMENTADA
router.put("/profile/:id", authMiddleware, upload.single("avatar"), usersControllers.update);

// Ruta para eliminar usuario
// router.post("/delete/:id", authMiddleware, usersControllers.deleteUser);

// Ruta de Logout
router.post("/logout", usersControllers.logout);
// --- Fin Rutas ---

module.exports = router;