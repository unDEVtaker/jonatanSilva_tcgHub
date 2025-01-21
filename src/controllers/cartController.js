const cartController = {
    index: function (req, res) {
      res.render('cart', {title:'Cart - TCG.HUB'});
    }
  }
  module.exports = cartController;