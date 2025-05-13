function authMiddleware(req, res, next) {
  console.log("authMiddleware - Session:", req.session);
  if (req.session && req.session.user) {
    next();
  } else {
    return res.redirect('/users/login');
  }
}

module.exports = authMiddleware;