const loginVerify = (req, res, next) => {
    if (req.session.user) {
        console.log("usuario logueado");
        console.log(req.session.user);

        res.redirect("/users/profile/" + req.session.user.id);
    } else {
        next();
    }
};

module.exports = loginVerify;