'use strict';
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const net = require('net');
const methodOverride = require('method-override');
const session = require('express-session');

require('dotenv').config();

const db = require('./database/models/index')

const sessionSecret = process.env.SECRET || 'UN_SECRETO_DEFAULT_FUERTE_Y_LARGO';

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, '../public')));
app.use(methodOverride('_method'));

// --- Configuración de Routers (MODIFICADO para exportación directa) ---
// Ahora se requiere la instancia del router directamente.
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/products', require('./routes/products'));

app.use(function(req, res, next) {
  next(createError(404));
});

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

// Autenticar la conexión de Sequelize
(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Conexión a la base de datos establecida con éxito.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    process.exit(1); // Salir del proceso si no se puede conectar
  }
})();

// Conectar a la Base de Datos ANTES de iniciar el servidor
db.sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente con Sequelize.');
  })
  .then(() => {
    findAvailablePort(process.env.PORT || 3000, (PORT) => {
      app.listen(PORT, () => {
        console.log(`
        ***************************************
        Servidor funcionando en el puerto ${PORT}
        link --->>> http://localhost:${PORT}
        *************************************
        `);
      });
    });
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos o al iniciar la aplicación:', err);
    process.exit(1);
  });

module.exports = app;