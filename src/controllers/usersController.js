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

const usersControllers = {
  login: (req, res, next) => {
    res.render("users/login", { title: "Login - TCG HUB" });
  },
  processLogin: (req, res, next) => {
    const { correo, contrasena } = req.body; // Also get the password from the body
    const users = parseFile(readFile(directory));
    const errores = validationResult(req);

    // Find the user by email
    const user = users.find((user) => user.correo === correo);

    // --- NEW LOGIN ERROR HANDLING ---
    // Check if there are validation errors first (e.g., empty fields)
    if (!errores.isEmpty()) {
      console.log("Validation errors during login:", errores.array());
      return res.render("users/login", {
        title: "Login - TCG HUB",
        errores: errores.mapped(),
        correo: correo // Pass the entered email back
      });
    }

    // Check if the user exists and if the password is correct
    // Use bcrypt.compareSync to compare the provided password with the stored hash
    if (!user || !bcrypt.compareSync(contrasena, user.contrasena)) {
      console.log("Login failed: User not found or incorrect password for email:", correo);
      // Render the login page again with an error message
      return res.render("users/login", {
        title: "Login - TCG HUB",
        loginError: "Invalid credentials. Please try again.", // English error message
        correo: correo // Pass the entered email back so the user doesn't have to re-type it
      });
    }
    // --- END NEW LOGIN ERROR HANDLING ---


    // If user exists and password is correct, proceed with login
    // Destructure properties from the found user object
    const { nombre, id, avatar } = user;
    console.log("User logged in with ID:", id);

    // Set session data
    req.session.user = { correo, nombre, id, avatar };
    console.log("Session user set:", req.session.user);

    // Handle "Remember Me" cookie
    if (req.body.recuerdame) {
      console.log("Setting 'Remember Me' cookie for user:", correo);
      // Note: Storing sensitive info like ID/avatar directly in a cookie might not be ideal.
      // Consider storing a token or a less sensitive identifier and looking up user data on subsequent requests.
      res.cookie("user", { correo, nombre, id, avatar }, { maxAge: 1000 * 60 * 30 }); // Cookie lasts 30 minutes
    }

    // Redirect after successful login
    res.redirect(`/`);
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
  store: function (req, res, next) {
    try {
      console.log("Entrando a usersControllers.store");
      const users = parseFile(readFile(directory));
      const { nombre, correo, contrasena } = req.body;
      const errores = validationResult(req);
      console.log("Errores de validación (store):", errores.array());

      if (!errores.isEmpty()) { // Check if validationResult is NOT empty
        console.log("Validation errors during signup, rendering signup.");
        return res.render("users/signup", { // Use return here to stop execution
          title: "Create an Account - TCG HUB",
          errores: errores.mapped(),
          nombre,
          correo,
          // Do NOT pass the password back for security reasons
        });
      }

      // Check if user with this email already exists before hashing and saving
      const existingUser = users.find(user => user.correo === correo);
      if (existingUser) {
        console.log("Signup failed: Email already exists:", correo);
        return res.render("users/signup", {
          title: "Create an Account - TCG HUB",
          errores: {
            correo: {
              msg: "This email is already registered." // Error message for existing email
            }
          },
          nombre,
          correo
        });
      }


      bcrypt.hash(contrasena, 10, function (err, hash) {
        if (err) {
          console.error("Error hashing password:", err);
          // Handle error, maybe render signup again with a generic error message
          return res.render("users/signup", {
            title: "Create an Account - TCG HUB",
            genericError: "An error occurred during registration. Please try again.",
            nombre,
            correo
          });
        }

        console.log("Hash generated successfully.");
        const newUser = {
          id: uuidv4(),
          nombre,
          correo,
          contrasena: hash, // Store the hashed password
          category: "user", // Default category
          avatar: "/images/users/default-avatar.png", // Default avatar
          dni: "", // Default empty fields
          provincia: "",
          localidad: "",
          calle: "",
          altura: "",
          telefono: "",
          createdAt: new Date().toISOString(), // Use ISO string for consistent date format
          updatedAt: new Date().toISOString(),
        };
        users.push(newUser);
        console.log("New user created:", newUser.id, newUser.correo);
        writeFile(directory, stringifyFile(users));
        console.log("User saved to file, redirecting to login.");
        res.redirect("/users/login");
      });

    } catch (error) {
      console.error("Error caught in store:", error);
      // Handle general errors during signup process
      res.render("error", { title: "Server Error", error }); // Render a generic error page
    }
  },
  profile: async (req, res) => {
    const users = parseFile(readFile(directory));
    const id = req.params.id;
    try {
      const user = users.find((user) => user.id === id);

      if (!user) {
        return res.status(404).send("User not found"); // Handle user not found
      }

      // Fetch provinces
      const responseProvincias = await fetch("https://apis.datos.gob.ar/georef/api/provincias");
      if (!responseProvincias.ok) {
        console.error("Error fetching provinces:", responseProvincias.status, responseProvincias.statusText);
        // Decide how to handle this error - maybe render profile without provinces/localities or show an error message
        // For now, we'll proceed but provinces/localities will be empty or cause errors in the view if not handled there.
        // A more robust approach would be to render an error page or pass an error flag to the profile view.
        // throw new Error("Hubo un problema con la peticion de provincias"); // Or handle gracefully
      }
      const dataProvincias = await responseProvincias.json();
      const provincias = dataProvincias.provincias ? dataProvincias.provincias.sort((a, b) => a.nombre.localeCompare(b.nombre)) : []; // Handle case where provincias array is missing

      // Determine which province ID to use for fetching localities
      const idProvincia = user.provincia && provincias.find(p => p.id === user.provincia) ? user.provincia : (provincias.length > 0 ? provincias[0].id : null); // Use user's province if valid, otherwise first province, otherwise null

      let localidades = [];
      if (idProvincia) { // Only fetch localities if a valid province ID is determined
        const responseLocalidades = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${idProvincia}&max=500`);
        if (!responseLocalidades.ok) {
          console.error("Error fetching localities:", responseLocalidades.status, responseLocalidades.statusText);
          // Handle error fetching localities
        } else {
          const dataLocalidades = await responseLocalidades.json();
          localidades = dataLocalidades.localidades ? dataLocalidades.localidades.sort((a, b) => a.nombre.localeCompare(b.nombre)) : []; // Handle case where localidades array is missing
        }
      }


      // Pass user, provinces, and localities to the view
      res.render("users/profile", { title: "Profile", user, provincias, localidades });

    } catch (error) {
      console.error("Error loading profile:", error);
      // If you don't have a specific error view, send an error response directly
      res.status(500).send("Error loading profile: " + error.message);
    }
  },
  update: (req, res) => {
    console.log("update - Session (start):", req.session);
    console.log("update - req.body:", req.body);
    console.log("update - req.file:", req.file); // Log file info if using multer

    const users = parseFile(readFile(directory));
    const id = req.params.id;
    const userToUpdate = users.find((user) => user.id === id);

    if (!userToUpdate) {
      return res.status(404).send("User not found");
    }

    // Basic validation check (you might have more detailed validation middleware before this)
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      console.log("Validation errors during update:", errores.array());
      // Re-render the profile page with validation errors and old data
      // You'll need to fetch provinces/localities again for the select inputs
      // This requires calling the profile logic or duplicating it here.
      // A better approach is often to handle validation *before* the controller function.
      return res.render("users/profile", {
        title: "Profile",
        user: userToUpdate, // Pass the original user data
        errores: errores.mapped(),
        // You need to fetch provinces and localities here or pass them from a middleware
        provincias: [], // Placeholder - fetch real data or pass it
        localidades: [] // Placeholder - fetch real data or pass it
      });
    }


    // Update user properties
    userToUpdate.nombre = req.body.nombre;
    userToUpdate.correo = req.body.correo; // Be careful with email updates - might need re-verification
    userToUpdate.dni = req.body.dni;
    userToUpdate.provincia = req.body.provincia;
    userToUpdate.localidad = req.body.localidad;
    userToUpdate.calle = req.body.calle;
    userToUpdate.altura = req.body.altura;
    userToUpdate.telefono = req.body.telefono;
    userToUpdate.updatedAt = new Date().toISOString();

    // Handle password update if new passwords are provided
    if (req.body.contrasena && req.body.contrasena2) {
      // You should also validate that contrasena and contrasena2 match,
      // perhaps using express-validator middleware before this controller function.
      // If they match and are valid, hash the new password.
      userToUpdate.contrasena = bcrypt.hashSync(req.body.contrasena, 10);
      console.log("Password updated for user:", userToUpdate.id);
    }
    // If contrasena is provided but contrasena2 is not, or vice versa,
    // or if validation fails, you should handle that error and re-render the form.


    // Handle avatar file upload if a new file is provided
    if (req.file) {
      // Optional: Delete the old avatar file if it's not the default one
      // const oldAvatarPath = path.join(__dirname, '../public/images/users', userToUpdate.avatar);
      // if (userToUpdate.avatar && userToUpdate.avatar !== '/images/users/default-avatar.png' && fs.existsSync(oldAvatarPath)) {
      //     try {
      //         fs.unlinkSync(oldAvatarPath);
      //         console.log("Deleted old avatar:", oldAvatarPath);
      //     } catch (unlinkError) {
      //         console.error("Error deleting old avatar:", unlinkError);
      //         // Decide how to handle this error (e.g., log it, but don't stop the update)
      //     }
      // }
      userToUpdate.avatar = '/images/users/' + req.file.filename; // Update avatar path
      console.log("Avatar updated for user:", userToUpdate.id, userToUpdate.avatar);
    }


    // Find the index and replace the user object
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
      users[index] = userToUpdate; // Replace the old user object with the updated one
    } else {
      // This case should ideally not happen if userToUpdate was found, but as a safeguard:
      console.error("Error updating user: User index not found after finding user object.");
      return res.status(500).send("Internal Server Error: Could not find user index for update.");
    }


    // Save the updated users array back to the file
    writeFile(directory, stringifyFile(users));
    console.log("User data saved to file.");

    // Update session user data if the logged-in user is the one being updated
    if (req.session.user && req.session.user.id === id) {
      // Only update session properties that might have changed and are stored in session
      req.session.user.nombre = userToUpdate.nombre;
      req.session.user.correo = userToUpdate.correo;
      req.session.user.avatar = userToUpdate.avatar;
      // Do NOT update password in session
      console.log("Session user data updated.");
    }


    console.log("update - Session (before redirect):", req.session);
    res.redirect(`/users/profile/${id}`); // Redirect to the profile page
  },
  deleteUser: (req, res) => {
    console.log("Attempting to delete user:", req.params.id);
    const users = parseFile(readFile(directory));
    const idToDelete = req.params.id;

    // Optional: Add a check to ensure the logged-in user is authorized to delete this account
    // e.g., if (req.session.user && req.session.user.id !== idToDelete && req.session.user.category !== 'admin') { ... return res.status(403).send('Forbidden'); }

    const initialUserCount = users.length;
    const newUsers = users.filter((user) => user.id !== idToDelete);
    const userDeleted = newUsers.length < initialUserCount;

    if (userDeleted) {
      writeFile(directory, stringifyFile(newUsers));
      console.log("User deleted:", idToDelete);

      // Destroy session and clear cookie ONLY if the deleted user was the logged-in user
      if (req.session.user && req.session.user.id === idToDelete) {
        req.session.destroy(err => {
          if (err) console.error("Error destroying session after user delete:", err);
          res.clearCookie("user");
          console.log("Session and cookie cleared for deleted user.");
          res.redirect("/users/signup"); // Redirect to signup or homepage after deleting own account
        });
      } else {
        // If an admin deleted another user, redirect admin to user list or dashboard
        // Assuming you have an admin dashboard for users
        res.redirect("/admin/users"); // Example: Redirect to admin user list
      }
    } else {
      console.warn("User not found for deletion:", idToDelete);
      res.status(404).send("User not found for deletion."); // User not found to delete
    }
  }
};

module.exports = usersControllers;
