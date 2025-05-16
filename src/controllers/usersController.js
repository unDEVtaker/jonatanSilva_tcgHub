const path = require("path");
const directory = path.join(__dirname, "../db/users.json");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const {
  readFile,
  writeFile,
  parseFile,
  stringifyFile,
} = require("../utils/filesystem");
const { v4: uuidv4 } = require("uuid");
const { log } = require("console");
const { Customer } = require('../database/models');

const usersControllers = {
  login: (req, res, next) => {
    res.render("users/login", { title: "Login - TCG HUB" });
  },
  processLogin: async (req, res, next) => {
    const { correo, contrasena } = req.body;
    const errores = validationResult(req);


    if (!errores.isEmpty()) {
      console.log("Errores de validación durante login:", errores.array());
      return res.render("users/login", {
        title: "Login - TCG HUB",
        errores: errores.mapped(),
        correo,
      });
    }

    try {

      const user = await Customer.findOne({ where: { correo } });

      if (!user || !bcrypt.compareSync(contrasena, user.contrasena)) {
        console.log("Login fallido: Usuario no encontrado o contraseña incorrecta para el correo:", correo);
        return res.render("users/login", {
          title: "Login - TCG HUB",
          loginError: "Credenciales invalidas. Por favor, inténtalo de nuevo.",
          correo,
        });
      }

      const { nombre, id, avatar } = user;
      console.log("Usuario ha iniciado sesión con ID:", id);

      req.session.user = { correo, nombre, id, avatar };
      console.log("Usuario de sesión establecido:", req.session.user);

      res.redirect(`/`);
    } catch (error) {
      console.error("Error durante el login:", error);
      res.render("error", { message: "Error al iniciar sesión", error });
    }
  },
  logout: (req, res) => {
    console.log("Cerrando sesión del usuario:", req.session.user ? req.session.user.correo : 'N/A');
    req.session.destroy(err => {
      if (err) {
        console.error("Error al destruir la sesión:", err);
      } else {
        console.log("Sesión destruida.");
        res.clearCookie("user");
        console.log("Cookie 'user' eliminada.");
        res.redirect("/");
      }
    });
  },
  signup: function (req, res, next) {
    res.render("users/signup", { title: "Create an Account - TCG HUB" });
  },
  store: async function (req, res, next) {
    try {
      console.log("Entrando a usersControllers.store");
      const { nombre, correo, contrasena } = req.body;
      const errores = validationResult(req);
      console.log("Errores de validación (store):", errores.array());

      if (!errores.isEmpty()) {
        console.log("Errores de validación durante registro, renderizando signup.");
        return res.render("users/signup", {
          title: "Create an Account - TCG HUB",
          errores: errores.mapped(),
          nombre,
          correo,
        });
      }

      const existingUser = await Customer.findOne({ where: { correo } });
      if (existingUser) {
        console.log("Registro fallido: El correo ya existe:", correo);
        return res.render("users/signup", {
          title: "Create an Account - TCG HUB",
          errores: {
            correo: {
              msg: "Este correo ya está registrado."
            }
          },
          nombre,
          correo
        });
      }

      const hashedPassword = await bcrypt.hash(contrasena, 10);
      const newUser = await Customer.create({
        nombre,
        correo,
        contrasena: hashedPassword,
        avatar: "/images/users/default-avatar.png",
        category: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("Nuevo usuario creado:", newUser.id, newUser.correo);
      res.redirect("/users/login");
    } catch (error) {
      console.error("Error en store:", error);
      res.render("error", { message: "Error al registrar el usuario", error });
    }
  },
  profile: async (req, res) => {
    if (!req.session.user) {
      return res.redirect('/users/login');
    }
    const id = req.params.id;
    try {
      const user = await Customer.findByPk(id);

      if (!user) {
        return res.status(404).send("Usuario no encontrado");
      }


      res.render("users/profile", {
        title: "Perfil de Usuario",
        user,
      });

    } catch (error) {
      console.error("Error cargando el perfil:", error);

      res.status(500).send("Error cargando el perfil: " + error.message);
    }
  },
  update: async (req, res) => {
    console.log("update - Método HTTP recibido:", req.method);
    console.log("update - Datos del formulario recibidos:", req.body);
    console.log("update - Archivo recibido:", req.file);

    const id = req.params.id;
    console.log("update - ID recibido:", id); 

    try {

      const userToUpdate = await Customer.findByPk(id);
      console.log("update - Usuario encontrado:", userToUpdate);

      if (!userToUpdate) {
        return res.status(404).send("Usuario no encontrado");
      }


      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        console.log("Errores de validación durante actualización:", errores.array());
        return res.render("users/profile", {
          title: "Profile",
          user: userToUpdate,
          errores: errores.mapped(),
        });
      }


      if (req.body.correo !== userToUpdate.correo) {
        const existingUser = await Customer.findOne({ where: { correo: req.body.correo } });
        console.log("update - Usuario con correo existente:", existingUser); // Registro del correo existente
        if (existingUser) {
          return res.render("users/profile", {
            title: "Profile",
            user: userToUpdate,
            errores: { correo: { msg: "Este correo ya está registrado." } },
          });
        }
      }


      userToUpdate.nombre = req.body.nombre;
      userToUpdate.correo = req.body.correo;
      userToUpdate.nick_name = req.body.nick_name;

      if (req.file) {
        userToUpdate.profile = '/images/users/' + req.file.filename;
      }
      userToUpdate.updatedAt = new Date();


      await userToUpdate.save();


      req.session.user = {
        id: userToUpdate.id,
        nombre: userToUpdate.nombre,
        correo: userToUpdate.correo,
        nick_name: userToUpdate.nick_name,
        avatar: userToUpdate.profile
      };
      console.log("update - Sesión actualizada:", req.session.user);

      console.log("Usuario actualizado:", userToUpdate);
      res.redirect(`/users/profile/${id}`);
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.render("error", { message: "Error al actualizar el usuario", error });
    }
  },
  deleteUser: async (req, res) => {
    try {
      console.log("Intentando eliminar usuario (DB):", req.params.id);
      const idToDelete = req.params.id;
      const user = await Customer.findByPk(idToDelete);
      if (!user) {
        console.warn("Usuario no encontrado para eliminar:", idToDelete);
        return res.status(404).send("Usuario no encontrado para eliminar.");
      }
      await user.destroy();
      console.log("Usuario eliminado de la base de datos:", idToDelete);
      if (req.session.user && req.session.user.id == idToDelete) {
        req.session.destroy(err => {
          if (err) console.error("Error al destruir la sesión después de eliminar usuario:", err);
          res.clearCookie("user");
          console.log("Sesión y cookie eliminadas para el usuario borrado.");

          res.redirect("/?userDeleted=1");
        });
      } else {
        res.redirect("/admin/users");
      }
    } catch (error) {
      console.error("Error eliminando usuario de la base de datos:", error);
      res.status(500).send("Error eliminando usuario de la base de datos");
    }
  }
};

module.exports = usersControllers;