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

    // Check for validation errors
    if (!errores.isEmpty()) {
      console.log("Validation errors during login:", errores.array());
      return res.render("users/login", {
        title: "Login - TCG HUB",
        errores: errores.mapped(),
        correo, // Pass the entered email back
      });
    }

    try {
      // Find the user in the database
      const user = await Customer.findOne({ where: { correo } });

      // Check if the user exists and if the password is correct
      if (!user || !bcrypt.compareSync(contrasena, user.contrasena)) {
        console.log("Login failed: User not found or incorrect password for email:", correo);
        return res.render("users/login", {
          title: "Login - TCG HUB",
          loginError: "Credenciales inválidas. Por favor, inténtalo de nuevo.",
          correo, // Pass the entered email back
        });
      }

      // If user exists and password is correct, proceed with login
      const { nombre, id, avatar } = user;
      console.log("User logged in with ID:", id);

      // Set session data
      req.session.user = { correo, nombre, id, avatar };
      console.log("Session user set:", req.session.user);

      // Redirect after successful login
      res.redirect(`/`);
    } catch (error) {
      console.error("Error during login:", error);
      res.render("error", { message: "Error al iniciar sesión", error });
    }
  },
  logout: (req, res) => {
    console.log("Logging out user:", req.session.user ? req.session.user.correo : 'N/A');
    req.session.destroy(err => {
      if (err) {
        console.error("Error destroying session:", err);
        // Handle error, maybe redirect to a generic error page
      } else {
        console.log("Session destroyed.");
        res.clearCookie("user"); // Clear the "Remember Me" cookie
        console.log("Cookie 'user' cleared.");
        res.redirect("/"); // Redirect to homepage or login page
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
        console.log("Validation errors during signup, rendering signup.");
        return res.render("users/signup", {
          title: "Create an Account - TCG HUB",
          errores: errores.mapped(),
          nombre,
          correo,
        });
      }

      // Verificar si el correo ya existe en la base de datos
      const existingUser = await Customer.findOne({ where: { correo } });
      if (existingUser) {
        console.log("Signup failed: Email already exists:", correo);
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

      // Crear un nuevo usuario
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
    // Si no está logueado, redirigir a login
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
      console.error("Error loading profile:", error);

      res.status(500).send("Error loading profile: " + error.message);
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
        console.log("Validation errors during update:", errores.array());
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
      userToUpdate.dni = req.body.dni;
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
  deleteUser: (req, res) => {
    console.log("Attempting to delete user:", req.params.id);
    const users = parseFile(readFile(directory));
    const idToDelete = req.params.id;


    const initialUserCount = users.length;
    const newUsers = users.filter((user) => user.id !== idToDelete);
    const userDeleted = newUsers.length < initialUserCount;

    if (userDeleted) {
      writeFile(directory, stringifyFile(newUsers));
      console.log("User deleted:", idToDelete);

      if (req.session.user && req.session.user.id === idToDelete) {
        req.session.destroy(err => {
          if (err) console.error("Error destroying session after user delete:", err);
          res.clearCookie("user");
          console.log("Session and cookie cleared for deleted user.");
          res.redirect("/users/signup"); 
        });
      } else {
        res.redirect("/admin/users");
      }
    } else {
      console.warn("User not found for deletion:", idToDelete);
      res.status(404).send("User not found for deletion."); // User not found to delete
    }
  }
};

module.exports = usersControllers;