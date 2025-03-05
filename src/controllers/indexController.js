const { readJson } = require('../db/index.js')
const { toThousand, paginator } = require('../utils')


//proximamente
function getRandomProducts(products, count) {
  const shuffled = products.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

module.exports = {
  index: (req, res) => {
    const products = readJson('productsDataBase.json')

    const newProducts = products.filter(product => product.isNew);
    const randomNewProducts = getRandomProducts(newProducts, 12); // Obtiene 12 productos aleatorios

    const topCards = products.filter(product => product.isTopCard);
    const randomTopCards = getRandomProducts(topCards, 12); // Obtiene 12 productos aleatorios


    res.render('home', {
      NewProducts: randomNewProducts, // Pasa los 12 productos aleatorios a la vista
      topCards: randomTopCards,
      toThousand
    })
  },
}