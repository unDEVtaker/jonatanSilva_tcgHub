//requiero fs para trabajar con fileS
const fs = require('fs')
//requiero path para trabajar con las rutas
const path = require('path')
const multer = require('multer');

//requiero utlites, toThousand para el precio
//requiero utlites, toThousand para el precio
const { toThousand } = require('../utils')
const { readJson, saveJson   } = require('../db/index.js')

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images/cartasDb'));
    },
    filename: (req, file, cb) => {
        const fileName = `${Date.now()}${path.extname(file.originalname)}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage });





module.exports = {
    list: (req, res) => {
        const products = readJson('productsDataBase.json')
        return res.render('products/productsList', {
            products,
            toThousand
        })
    },
    detail: (req, res) => {
        const products = readJson('productsDataBase.json')
        const product = products.find(product => product.id === +req.params.id)

        return res.render('products/productDetail', {
            ...product,
            toThousand
        })
    },
    sproduct: (req, res) => {
        const productId = parseInt(req.params.id);
        const products = readJson('productsDataBase.json');
        const product = products.find(p => p.id === productId);

        if (product) {
            const newProducts = products.filter(p => p.isNew).slice(0, 12);
            
            res.render('sproduct', {
                product,
                title: product.name + ' - TCG.HUB',
                NewProducts: newProducts,
                toThousand: toThousand
            });
        } else {
            res.send('Producto no encontrado');
        }
    },
    shop: (req, res) => {
        const products = readJson('productsDataBase.json');
        const limitedProducts = products.slice(0, 24); // Limita a los primeros 18 productos
        res.render('shop', {
            title: 'Shop - TCG.HUB',
            products: limitedProducts,
            toThousand: toThousand
        });
    },

    //crud

    //dashboard
    productsAdmin: (req, res) => {
        const products = readJson('productsDataBase.json');
        const searchTerm = req.query.search;

        let filteredProducts = products;

        if (searchTerm) {
            filteredProducts = products.filter(product => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    product.name.toLowerCase().includes(searchLower) ||
                    product.id.toString().includes(searchTerm) ||
                    product.rarity.toLowerCase().includes(searchLower) ||
                    product.price.toString().includes(searchTerm)
                );
            });
        }
        res.render('products/productsAdmin', {
            products: filteredProducts,
            toThousand
        });
    },

    //detalle
    detail: (req, res) => {
        const products = readJson('productsDataBase.json');
        const product = products.find(p => p.id === parseInt(req.params.id));

        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        res.render('products/productDetail', {
            product,
            toThousand
        });
    },

    //editar y actualziar

    edit: (req, res) => {
        const products = readJson('productsDataBase.json');
        const product = products.find(p => p.id === parseInt(req.params.id));

        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        res.render('products/productEdit', {
            product
        });
    },
    update: (req, res) => {
        const products = readJson('productsDataBase.json');
        const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));

        if (productIndex === -1) {
            return res.status(404).send('Producto no encontrado');
        }

        products[productIndex] = {
            ...products[productIndex],
            name: req.body.name,
            rarity: req.body.rarity,
            attack: parseInt(req.body.attack),
            defense: parseInt(req.body.defense),
            imageUrl: req.body.imageUrl,
            yearReleased: parseInt(req.body.yearReleased),
            price: parseInt(req.body.price),
            isNew: req.body.isNew === 'on',
            isTopCard: req.body.isTopCard === 'on',
            description: req.body.description,
            id: parseInt(req.params.id)
        };

        saveJson ('productsDataBase.json', products);
        res.redirect('/products/admin');
    },

    remove: function(req, res) {
        const products = readJson('productsDataBase.json');
        const { id } = req.params;

        const productsModify = products.filter(product => product.id !== parseInt(id));

        saveJson('productsDataBase.json', productsModify);

        return res.redirect('/products/admin'); // Redirige a /products/admin
    },

    
    add: (req, res) => {
        res.render('products/productCreate'); // Asegúrate de que esta vista exista
    },
    create: [
        upload.single('image'), // 'image' debe coincidir con el nombre del campo en el formulario
        (req, res) => {
            console.log('Archivo cargado:', req.file); // Agrega esta línea
            const products = readJson('productsDataBase.json');
            const { name, rarity, attack, defense, yearReleased, price, isNew, isTopCard, description } = req.body;
            const imageUrl = req.file ? `/images/cartasDb/${req.file.filename}` : '/images/cartasDb/default-image.png'; // Ruta de la imagen cargada o una imagen predeterminada

            // Validación de campos requeridos
            if (!name || !rarity || !description || !price) {
                return res.status(400).send('Todos los campos requeridos deben estar presentes.');
            }

            // Validación del precio
            if (isNaN(parseInt(price))) {
                return res.status(400).send('El precio debe ser un número válido.');
            }

            // Manejo de id
            const newProductId = products.length > 0 ? products[products.length - 1].id + 1 : 1;

            const newProduct = {
                id: newProductId,
                name: name.trim(),
                rarity: rarity.trim(),
                attack: parseInt(attack),
                defense: parseInt(defense),
                imageUrl: imageUrl,
                yearReleased: parseInt(yearReleased),
                price: parseInt(price),
                isNew: isNew === 'on',
                isTopCard: isTopCard === 'on',
                description: description.trim()
            };

            products.push(newProduct);
            saveJson('productsDataBase.json', products);

            return res.redirect('/products/detail/' + newProduct.id);
        }
    ],
};