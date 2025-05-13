const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const net = require('net'); // modulo para buscar el puerto
const methodOverride = require('method-override');
const { body } = require("express-validator"); // Aunque body se usa en routes, es común verlo importado aquí a veces. Lo dejamos.
const session = require('express-session'); // Añadido: Middleware de sesión

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// middleware de sesión
app.use(session({
  secret: 'SECRETO',
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, '../public')));
app.use(methodOverride('_method'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products',productsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

const findAvailablePort = (startPort, callback) => {
  const server = net.createServer();
  server.listen(startPort, () => {
    server.once('close', () => callback(startPort));
    server.close();
  });
  server.on('error', () => findAvailablePort(startPort + 1, callback));
};

findAvailablePort(3000, (PORT) => {
  app.listen(PORT, () => {
    console.log(`
    ***************************************
    Servidor funcionando en el puerto ${PORT}
    link --->>> http://localhost:${PORT}
    **************************************
    `);
  });
});

module.exports = app;