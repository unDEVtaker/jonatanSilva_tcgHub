const path = require("path");
const productsDirectory = path.join(__dirname, "../db/productsDataBase.json");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const {
    readFile,
    writeFile,
    parseFile,
    stringifyFile,
} = require("../utils/filesystem");
const { v4: uuidv4 } = require("uuid");
const { log } = require("console");
const fetch = require('node-fetch');
const { toThousand } = require('../utils');
const { Product, State, Customer } = require('../database/models');

const productsControllers = {
    list: async (req, res) => {
        try {

            const products = await Product.findAll({
                order: [['createdAt', 'DESC']],
                limit: 16
            });
            res.render('home', {
                title: 'Home - TCG HUB',
                user: req.session.user,
                NewProducts: products,
                toThousand: toThousand
            });
        } catch (error) {
            console.error("Error al obtener el producto:", error);
            res.status(500).send("Error al obtener producto");
        }
    },

    sproduct: async (req, res) => {

        const apiId = req.params.api_id;
        try {
            const product = await Product.findOne({
                where: { api_id: apiId },
                include: [{ model: State, as: 'state' }]
            });
            if (!product) {
                return res.status(404).render('error', {
                    title: 'Producto no encontrado',
                    message: `No se encontró "${apiId}" en nuestra base de datos.`,
                    error: { status: 404 }
                });
            }
    
            let seller = null;
            if (product.customer_id) {
                seller = await Customer.findByPk(product.customer_id, {
                    attributes: ['id', 'nombre', 'nick_name']
                });
            }
            const API_URL = `https://api.pokemontcg.io/v2/cards/${apiId}`;
            let card = null;
            try {
                const response = await fetch(API_URL);
                if (response.ok) {
                    const data = await response.json();
                    card = data.data;
                    console.log('CARD DATA API:', card);
                }
            } catch (err) {
                card = null;
            }
            res.render('sproduct', {
                title: (card && card.name ? card.name : product.nombre) + ' - TCG HUB',
                product,
                card,
                seller,
                toThousand
            });
        } catch (error) {
            console.error('Error al obtener el producto por api_id:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error al obtener el producto por api_id',
                error: { status: 500 }
            });
        }
    },

    index: (req, res) => {
        res.send('Página principal de productos');
    },

    shop: (req, res) => {
        const products = parseFile(readFile(productsDirectory));
        const limitedProducts = products.slice(0, 24);
        res.render('shop', {
            title: 'Shop - TCG.HUB',
            products: limitedProducts,
            toThousand: toThousand
        });
    },

    //crud

    productsAdmin: async (req, res) => {
        try {
            const searchTerm = req.query.search;
            // Primero obtener solo los productos del usuario
            let userProducts = await Product.findAll({
                where: {
                    customer_id: req.session.user.id
                }
            });

            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                userProducts = userProducts.filter(product =>
                    (product.nombre && product.nombre.toLowerCase().includes(searchLower)) ||
                    (product.id && product.id.toString().includes(searchTerm)) ||
                    (product.set_name && product.set_name.toLowerCase().includes(searchLower)) ||
                    (product.cardNumber && product.cardNumber.toString().includes(searchTerm)) ||
                    (product.foilType && product.foilType.toLowerCase().includes(searchLower))
                );
            }

            const totalValue = userProducts.reduce((sum, product) => {
                const precio = Number(product.precio);
                return isNaN(precio) ? sum : sum + precio;
            }, 0);

            res.render('products/productsAdmin', {
                products: userProducts,
                toThousand,
                totalValue,
                query: req.query,
                user: req.session.user
            });
        } catch (error) {
            console.error("Error al obtener los productos de administrador.", error);
            res.status(500).send(`Error al obtener productos de administración: ${error.message}`);
        }
    },

    adminProductDetail: (req, res) => {
        const products = parseFile(readFile(productsDirectory));
        const product = products.find(p => p.id === parseInt(req.params.id));

        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        res.render('products/productDetail', {
            product,
            toThousand
        });
    },

    remove: async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id);

            if (!product) {
                return res.status(404).send('Producto no encontrado');
            }

            if (req.session.user && product.user_id !== req.session.user.id) {
                return res.status(403).send('No autorizado para eliminar este producto');
            }

            await product.destroy();
            res.redirect('/products/admin?deleted=1');
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            res.status(500).send("Error al eliminar el producto");
        }
    },

    edit: async (req, res) => {
        try {

            const product = await Product.findByPk(req.params.id, {
                include: [{ model: State, as: 'state' }]
            });
            if (!product) {
                return res.status(404).send('Product not found');
            }
            if (req.session.user && product.customer_id !== req.session.user.id) {
                return res.status(403).send('No autorizado para editar este producto');
            }

            const states = await State.findAll();
            res.render('products/productEdit', {
                title: 'Edit Product',
                product: product.toJSON(),
                states
            });
        } catch (error) {
            console.error("Error al obtener el producto para editar:", error);
            res.status(500).send("Error al obtener el producto para editar");
        }
    },

    update: async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id);

            if (!product) {
                return res.status(404).send('Product not found');
            }

            if (req.session.user && product.customer_id !== req.session.user.id) {
                return res.status(403).send('Unauthorized to update this product');
            }

            const errores = validationResult(req);
            if (!errores.isEmpty()) {
                console.log('ERRORES VALIDACION EDIT:', errores.array());
                const states = await State.findAll();
                return res.render('products/productEdit', {
                    title: 'Edit Product',
                    product: { ...product.toJSON(), ...req.body },
                    states,
                    errores: errores.mapped(),
                });
            }


            await product.update({
                nombre: req.body.name,
                descripcion: req.body.description,
                precio: Number(req.body.price),
                set_name: req.body.set,
                foilType: req.body.foilType,
                stock: req.body.stock || 0,
                api_id: req.body.cardId,
                // cardNumber: req.body.cardNumber, 
                img: req.body.cardImage,
                state_id: req.body.state_id,
                updatedAt: new Date(),
            });

            res.redirect('/products/admin?edited=1');
        } catch (error) {
            console.error("Error al actualizar producto:", error);
            res.status(500).send("Error al actualizar producto");
        }
    },

    create: async (req, res) => {
        console.log("Intentando crear producto.");
        console.log("Create body:", req.body);
        console.log("Create file:", req.file);

        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            console.log("Errores de validación durante la creación del producto.:", errores.array());
            return res.render('products/productCreate', {
                title: 'Create New Product',
                errores: errores.mapped(),
                oldData: req.body
            });
        }

        try {
            const newProduct = await Product.create({
                nombre: req.body.name,
                descripcion: req.body.description,
                precio: Number(req.body.price),
                set_name: req.body.set,
                foilType: req.body.foilType,
                stock: req.body.stock || 0,
                api_id: req.body.cardId,
                customer_id: req.session.user.id,
                img: req.body.cardImage || 'default-product-image.jpg', 
                state_id: req.body.state_id,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            console.log("Producto nuevo creado y guardado.:", newProduct.id, newProduct.nombre);

            res.redirect('/products/admin?created=1');
        } catch (error) {
            console.error("Error creando el producto:", error);
            res.render('error', { message: "Error creando el producto", error });
        }
    },

    add: async (req, res) => {

        const states = await State.findAll();
        res.render('products/productCreate', {
            title: 'Crear Nuevo Producto',
            states
        });
    },

    detail: async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id, {
                include: [{ model: State, as: 'state' }]
            });
            if (!product) {
                return res.status(404).send('Producto no encontrado');
            }
            res.render('products/productDetail', {
                product,
                toThousand
            });
        } catch (error) {
            console.error("Error al buscar el producto en la base de datos:", error);
            res.status(500).send("Error al buscar el producto");
        }
    },

    delete: async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id);
            if (!product) {
                return res.status(404).send('Producto no encontrado');
            }
            if (req.session.user && product.customer_id !== req.session.user.id) {
                return res.status(403).send('No autorizado para eliminar este producto');
            }
            await product.destroy();
            res.redirect('/products/admin?deleted=1');
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            res.status(500).send("Error al eliminar el producto");
        }
    },


    apiList: async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 24;
        const offset = (page - 1) * pageSize;
        const set = req.query.set;
        const where = {};
        if (set) {
            where.set_name = set;
        }
        try {
            const products = await Product.findAll({
                where,
                order: [['createdAt', 'DESC']],
                limit: pageSize,
                offset,
            });
            res.json({ products });
        } catch (error) {
            res.status(500).json({ error: 'Error al cargar productos' });
        }
    },
};

module.exports = productsControllers;