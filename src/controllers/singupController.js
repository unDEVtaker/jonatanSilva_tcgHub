const singupController = {
    index: function (req, res) {
      res.render('singup', {title:'Sing Up - TCG.HUB'});
    }
  }
  module.exports = singupController;