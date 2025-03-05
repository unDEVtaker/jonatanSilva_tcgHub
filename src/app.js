const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const net = require('net'); // modulo para buscar el puerto
const methodOverride = require('method-override');


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
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//const PORT = process.env.PORT || 3005;
// Función para encontrar un puerto libre a partir de 3000
const findAvailablePort = (startPort, callback) => {
  const server = net.createServer();

  server.listen(startPort, () => {
    server.once('close', () => callback(startPort));
    server.close();
  });

  server.on('error', () => findAvailablePort(startPort + 1, callback));
};

// Buscar un puerto disponible desde 3000
findAvailablePort(3000, (PORT) => {
  app.listen(PORT, () => {
    console.log(`
    ***************************************
    Servidor funcionando en el puerto ${PORT}
    link --->>> http://localhost:${PORT}
    ***************************************
    `);
  });
});

module.exports = app;
