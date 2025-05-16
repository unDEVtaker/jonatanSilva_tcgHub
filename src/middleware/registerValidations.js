const { body } = require('express-validator');

const registerValidations = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres.'),
  body('correo')
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('Debe ser un correo válido.'),
  body('contrasena')
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
];

module.exports = registerValidations;
