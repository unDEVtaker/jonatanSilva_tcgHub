const path = require("path");
const { validationResult } = require("express-validator");
const fetch = require('node-fetch'); // Para usar fetch en el backend
const { toThousand } = require('../utils'); // Si aún necesitas esta función
const { Product, State } = require('../database/models');

function random(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const indexController = {
    // Solo funciones de home y landing, sin lógica de productos ni usuarios
    home: async (req, res) => {
        try {
            // Obtener todos los productos una sola vez
            let allProducts = await Product.findAll();
            // NewProducts: random 18 de todos
            let NewProducts = random([...allProducts]).slice(0, 18);
            // topCards: random 12 solo con state_id=1
            let topCards = random(allProducts.filter(p => p.state_id === 1)).slice(0, 12);

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