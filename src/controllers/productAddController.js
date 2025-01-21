const fs = require('fs');
const path = require('path');
const cartasFilePath = path.join(__dirname, '../db/cartas.json');

const productAddController = {
    index: function (req, res) {
      fs.readFile(cartasFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error leyendo el archivo:', err);
          return res.status(500).send('Error interno del servidor');
        }
        const products = JSON.parse(data || '[]');
        res.render('productAdd', {title:'Add - Admin', products: products});
      });
    },
    create: function (req, res) {
      const newProduct = req.body;
      fs.readFile(cartasFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error leyendo el archivo:', err);
          return res.status(500).send('Error interno del servidor');
        }
        const products = JSON.parse(data || '[]');
        products.push(newProduct);
        fs.writeFile(cartasFilePath, JSON.stringify(products, null, 2), (err) => {
          if (err) {
            console.error('Error escribiendo en el archivo:', err);
            return res.status(500).send('Error interno del servidor');
          }
          res.redirect('/productAdd');
        });
      });
    }
}
module.exports = productAddController;