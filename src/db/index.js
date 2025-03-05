const path = require('path');
const fs = require('fs');

//funciones para leer el archivo JSON o db
const readJson = (file = "") => {
    return JSON.parse(fs.readFileSync(path.join(__dirname,file),'utf-8'))
}

const saveJson = (file = "", array = []) => {
    fs.writeFileSync(path.join(__dirname,file),JSON.stringify(array,null,2),'utf-8')
    return null
}

module.exports = {
    saveJson,
    readJson
}