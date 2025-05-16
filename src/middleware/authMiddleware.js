function authMiddleware(req, res, next) {
  console.log("authMiddleware - Session completa:", req.session);
  console.log("authMiddleware - Usuario en sesión:", req.session.user);
  if (req.session && req.session.user) {
    next();
  } else {
    console.log("authMiddleware - Redirigiendo a login");
    return res.redirect('/users/login');
  }
}

module.exports = authMiddleware;