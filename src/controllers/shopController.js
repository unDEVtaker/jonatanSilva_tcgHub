const shopController = {
    index: function (req, res) {
      res.render('shop', {title:'Shop - TCG.HUB'});
    }
  }
  module.exports = shopController;