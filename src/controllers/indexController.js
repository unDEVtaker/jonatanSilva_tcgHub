const { readJson } = require('../db/index.js');
const { toThousand, paginator } = require('../utils');

//proximamente
function getRandomProducts(products, count) {
  const shuffled = products.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

module.exports = {
  index: (req, res) => {
    const products = readJson('productsDataBase.json');
    const newProducts = products.filter(product => product.isNew);
    const randomNewProducts = getRandomProducts(newProducts, 12);
    const topCards = products.filter(product => product.isTopCard);
    const randomTopCards = getRandomProducts(topCards, 12);

    res.render('home', {
      NewProducts: randomNewProducts,
      topCards: randomTopCards,
      toThousand,
      user: req.session.user  // Pasamos el usuario a la vista
    });
  },
    sellCard: (req, res) => { //Aca iria el controlador de sellCard
    res.render('sell-card', { title: 'Sell Your Card - TCG HUB', user: req.session.user });
  }
};