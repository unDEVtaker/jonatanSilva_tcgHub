
const indexController = {
    index:function(req, res, next) {
      res.render('index', { title: 'TCG.HUB'});
    }
  }
  module.exports = indexController;