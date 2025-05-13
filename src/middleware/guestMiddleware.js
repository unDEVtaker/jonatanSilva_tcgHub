function guestMiddleware(req, res, next) {

    if (req.session.user) {

        return res.redirect('/users/profile/' + req.session.user.id);

    }

    next();
}

module.exports = guestMiddleware;