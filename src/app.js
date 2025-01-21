var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var singupRouter = require('./routes/singup');
var shopRouter = require('./routes/shop');
var sproductRouter = require('./routes/sproduct');
var cartRouter = require('./routes/cart');
var productAddRouter = require('./routes/productAdd');
var productEditRouter = require('./routes/productEdit');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Asegúrate de que extended esté en true
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/singup', singupRouter);
app.use('/shop', shopRouter);
app.use('/sproduct', sproductRouter);
app.use('/cart', cartRouter);
app.use('/productAdd', productAddRouter);
app.use('/productEdit', productEditRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});

module.exports = app;
