const path = require("path");
const { validationResult } = require("express-validator");
const fetch = require('node-fetch'); // Para usar fetch en el backend
const { toThousand } = require('../utils'); // Si aún necesitas esta función
const { Product, State } = require('../database/models');

const indexController = {
    // Solo funciones de home y landing, sin lógica de productos ni usuarios
    home: async (req, res) => {
        try {
            const NewProducts = await Product.findAll({
                order: [['createdAt', 'DESC']],
                limit: 16
            });
            // Obtener cartas top (state_id = 1)
            const topCards = await Product.findAll({
                where: { state_id: 1 },
                limit: 8,
                order: [['precio', 'DESC']],
            });
            res.render('home', {
                title: 'Home - TCG HUB',
                user: req.session.user,
                NewProducts,
                topCards,
                toThousand
            });
        } catch (error) {
            console.error('Error fetching products for home:', error);
            res.status(500).send('Error fetching products for home');
        }
    },
};

module.exports = indexController;