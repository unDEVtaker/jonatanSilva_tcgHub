const loginController = {
    index: function (req, res) {
      res.render('login', {title:'Login - TCG.HUB'});
    }
  }
  module.exports = loginController;