const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], { ...config, logging: false });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, { ...config, logging: false });
}

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const modelPath = path.join(__dirname, file);
    const model = require(modelPath);

    if (typeof model === 'function') {
      db[model(sequelize, DataTypes).name] = model(sequelize, DataTypes);
    } else {
      console.warn(`El archivo ${file} no exporta una función válida.`);
    }
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;