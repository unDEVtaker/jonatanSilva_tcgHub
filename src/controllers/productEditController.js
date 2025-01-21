const productEditController = {
  index: function (req, res) {
    res.render('productEdit', {title:'Edit - Admin'});
  }
}
module.exports = productEditController;