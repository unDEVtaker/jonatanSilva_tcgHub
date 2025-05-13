const path = require("path");
const directory = path.join(__dirname, "../db/users.json"); // Assuming this is for users now
const productsDirectory = path.join(__dirname, "../db/productsDataBase.json"); // Assuming this is your products JSON
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
const fetch = require('node-fetch'); // Need node-fetch to use fetch in backend

// Assuming you still need toThousand from utils
const { toThousand } = require('../utils');


const usersControllers = {
  // --- User Controller Functions ---
  login: (req, res, next) => {
    res.render("users/login", { title: "Login - TCG HUB" });
  },
  processLogin: (req, res, next) => {
    const { correo, contrasena } = req.body;
    const users = parseFile(readFile(directory));
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      console.log("Validation errors during login:", errores.array());
      return res.render("users/login", {
        title: "Login - TCG HUB",
        errores: errores.mapped(),
        correo: correo
      });
    }

    const user = users.find((user) => user.correo === correo);

    if (!user || !bcrypt.compareSync(contrasena, user.contrasena)) {
      console.log("Login failed: User not found or incorrect password for email:", correo);
      return res.render("users/login", {
        title: "Login - TCG HUB",
        loginError: "Invalid credentials. Please try again.",
        correo: correo
      });
    }

    const { nombre, id, avatar } = user;
    console.log("User logged in with ID:", id);

    req.session.user = { correo, nombre, id, avatar };
    console.log("Session user set:", req.session.user);

    if (req.body.recuerdame) {
      res.cookie("user", { correo, nombre, id, avatar }, { maxAge: 1000 * 60 * 30 });
    }

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
        console.log("User saved to file, redirigiendo a login.");
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
      //     try {
      //         fs.unlinkSync(oldAvatarPath);
      //         console.log("Deleted old avatar:", oldAvatarPath);
      //     } catch (unlinkError) {
      //         console.error("Error deleting old avatar:", unlinkError);
      //         // Decide how to handle this error (e.g., log it, but don't stop the update)
      //     }
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


// Assuming productsController is in a separate file or this object is part of a larger export
// If this is a separate file for users, you'll need a similar file for products controllers.
// For the purpose of this request, I will assume 'usersControllers' is just one part,
// and I'm adding the 'productsControllers' logic here as if it's in the same file
// or will be merged. If productsController is a separate file, adapt accordingly.

const productsControllers = {
  list: (req, res) => {
    const products = parseFile(readFile(productsDirectory)); // Assuming products are in productsDataBase.json
    return res.render('products/productsList', {
      products,
      toThousand
    })
  },

  ecommerceDetail: (req, res) => {
    const products = parseFile(readFile(productsDirectory));
    const product = products.find(product => product.id === +req.params.id);

    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }

    // You might want to fetch the creator user here if needed for the public detail page
    // const users = parseFile(readFile(directory));
    // const creatorUser = users.find(user => user.id === product.userId);


    return res.render('products/productDetail', {
      ...product,
      // creatorUser: creatorUser,
      toThousand
    })
  },

  // --- MODIFIED SPRODUCT FUNCTION TO FETCH FROM API AND INCLUDE SELLER ---
  sproduct: async (req, res) => {
    const productId = parseInt(req.params.id); // Get the internal database ID from the URL

    // Read your databases
    // Note: Reading files on every request can be inefficient for large databases.
    // Consider loading data once on application startup if possible.
    const products = parseFile(readFile(productsDirectory)); // Read your products database
    const users = parseFile(readFile(directory)); // <--- Read your users database

    // Find the product in your database using the internal ID
    const product = products.find(p => p.id === productId);

    // If the product is not found in your database
    if (!product) {
      console.warn(`Product with internal ID "${productId}" not found in database.`);
      return res.status(404).render('error', {
        title: 'Product Not Found',
        message: `Product with ID "${productId}" not found in our database.`,
        error: { status: 404 }
      });
    }

    // --- Busca el Vendedor ---
    // Asumiendo que el objeto product tiene una propiedad 'userId' que guarda el ID del usuario vendedor
    // Based on your user object structure, the product should likely have a 'userId' property
    // that links it to the user's 'id'.
    let seller = null; // Inicializa seller como null
    if (product.userId) { // <--- Using product.userId to find the seller
      // Busca el vendedor por ID en la base de datos de usuarios
      seller = users.find(user => user.id === product.userId); // <--- Find user by product.userId
      if (!seller) {
        console.warn(`Seller with ID "${product.userId}" not found in users database for product ID ${productId}.`);
        // If the seller is not found, 'seller' will remain null
      }
    } else {
      console.warn(`Product with ID ${productId} found, but is missing userId property.`);
      // If the product does not have userId, 'seller' will remain null
    }
    // --- Fin Busca el Vendedor ---


    // Get the API card ID from the found product
    // Added a check here just in case product is defined but cardId is missing
    if (!product.cardId) {
      console.error(`Product with ID ${productId} found, but is missing cardId property.`);
      return res.status(500).render('error', {
        title: 'Product Data Missing',
        message: `Product data for ID "${productId}" is incomplete (missing card ID).`,
        error: { status: 500 }
      });
    }
    const cardId = product.cardId; // <--- This line should now work if 'product' is defined and has 'cardId'
    const API_URL = `https://api.pokemontcg.io/v2/cards/${cardId}`;

    try {
      console.log(`Fetching card details from API for cardId: ${cardId} (from product ID: ${productId})`);
      const response = await fetch(API_URL);

      if (!response.ok) {
        // Handle HTTP errors from the API (e.g., 404 if card not found in API)
        console.error(`API responded with status: ${response.status} ${response.statusText} for cardId: ${cardId}`);
        return res.status(response.status).render('error', {
          title: 'Card Not Found in API',
          message: `Card with ID "${cardId}" not found on the Pokémon TCG API.`,
          error: { status: response.status }
        });
      }

      const data = await response.json();
      const card = data.data; // The card object is under the 'data' property

      if (!card) {
        // Handle case where API returns 200 but data.data is null/undefined
        console.error(`API returned data but no card object for cardId: ${cardId}`);
        return res.status(404).render('error', {
          title: 'Card Data Error',
          message: `Could not retrieve card data for ID "${cardId}" from the API.`,
          error: { status: 404 }
        });
      }

      console.log(`Successfully fetched card data for cardId: ${cardId}`);
      // console.log("Fetched card data:", card); // Log the fetched data for debugging

      // Render the sproduct.ejs template, passing both the database product, the fetched API card data, AND the seller
      res.render('sproduct', {
        title: card.name + ' - TCG HUB', // Set page title dynamically from API data
        product: product, // <--- Pass the product data from your database
        card: card, // <--- Pass the fetched API card data
        seller: seller, // <--- ¡Pass the seller object to the view!
        toThousand: toThousand // Pass toThousand if needed in this view
      });

    } catch (error) {
      // Handle network errors or other exceptions during the fetch
      console.error(`Error fetching card data from API for cardId ${cardId}:`, error);
      // Render a generic error page
      res.status(500).render('error', {
        title: 'Server Error',
        message: 'An error occurred while fetching card data.',
        error: error
      });
    }
  },
  // --- END MODIFIED SPRODUCT FUNCTION ---


  shop: (req, res) => {
    const products = parseFile(readFile(productsDirectory));
    const limitedProducts = products.slice(0, 24);
    res.render('shop', {
      title: 'Shop - TCG.HUB',
      products: limitedProducts,
      toThousand: toThousand
    });
  },

  //crud

  productsAdmin: (req, res) => {
    const products = parseFile(readFile(productsDirectory));
    const searchTerm = req.query.search;

    let filteredProducts = products;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredProducts = products.filter(product => {
        return (
          (product.name && product.name.toLowerCase().includes(searchLower)) ||
          (product.id !== undefined && product.id !== null && product.id.toString().includes(searchTerm)) ||
          (product.rarity && product.rarity.toLowerCase().includes(searchLower)) ||
          (product.price !== undefined && product.price !== null && product.price.toString().includes(searchTerm)) ||
          (product.set && product.set.toLowerCase().includes(searchLower)) ||
          (product.cardNumber !== undefined && product.cardNumber !== null && product.cardNumber.toString().includes(searchTerm)) ||
          (product.foilType && product.foilType.toLowerCase().includes(searchLower)) // Corrected variable name here from searchType to searchLower
        );
      });
    }

    const userProducts = filteredProducts.filter(product => req.session.user && product.userId === req.session.user.id); // Added check for req.session.user

    const totalValue = userProducts.reduce((sum, product) => {
      const price = typeof product.price === 'number' ? product.price : Number(product.price);
      if (isNaN(price)) return sum;
      return sum + price;
    }, 0);

    res.render('products/productsAdmin', {
      products: userProducts,
      toThousand,
      totalValue,
      query: req.query,
      user: req.session.user // Pass the logged-in user
    });
  },

  adminProductDetail: (req, res) => {
    const products = parseFile(readFile(productsDirectory));
    const product = products.find(p => p.id === parseInt(req.params.id));

    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }

    // Fetch the creator user if needed for the admin detail page
    // const users = parseFile(readFile(directory));
    // const creatorUser = users.find(user => user.id === product.userId);

    res.render('products/productDetail', { // Assuming productDetail.ejs is used for admin detail too
      product,
      // creatorUser: creatorUser,
      toThousand
    });
  },

  remove: (req, res) => {
    console.log("Attempting to delete product:", req.params.id);
    const products = parseFile(readFile(productsDirectory));
    const idToDelete = parseInt(req.params.id);

    const index = products.findIndex(p => p.id === idToDelete);
    if (index === -1) {
      console.warn("Product not found for deletion:", idToDelete);
      return res.status(404).send('Product not found');
    }

    // Optional: Verify user ownership before deleting
    if (req.session.user && products[index].userId !== req.session.user.id) {
      console.warn("Unauthorized attempt to delete product:", idToDelete, "by user:", req.session.user.id);
      return res.status(403).send('Unauthorized to delete this product');
    }

    products.splice(index, 1);
    writeFile(productsDirectory, stringifyFile(products));
    console.log("Product deleted:", idToDelete);

    res.redirect('/products/admin'); // Redirect to the admin list
  },

  edit: (req, res) => {
    console.log("Attempting to edit product:", req.params.id);
    const products = parseFile(readFile(productsDirectory));
    const idToEdit = parseInt(req.params.id);

    const productToEdit = products.find(p => p.id === idToEdit);

    if (!productToEdit) {
      console.warn("Product not found for editing:", idToEdit);
      return res.status(404).send('Product not found');
    }

    // Optional: Verify user ownership before editing
    if (req.session.user && productToEdit.userId !== req.session.user.id) {
      console.warn("Unauthorized attempt to edit product:", idToEdit, "by user:", req.session.user.id);
      return res.status(403).send('Unauthorized to edit this product');
    }

    // Render the edit form, passing the product data
    res.render('products/productEdit', {
      title: 'Edit Product',
      product: productToEdit,
      // You might need to pass other data needed for the form, like categories
      // categories: readJson('productCategories.json')
    });
  },

  update: (req, res) => {
    console.log("Attempting to update product:", req.params.id);
    console.log("Update body:", req.body);
    console.log("Update file:", req.file); // If using Multer

    const products = parseFile(readFile(productsDirectory));
    const idToUpdate = parseInt(req.params.id);

    const index = products.findIndex(p => p.id === idToUpdate);

    if (index === -1) {
      console.warn("Product not found for update:", idToUpdate);
      return res.status(404).send('Product not found');
    }

    const productToUpdate = products[index];

    // Optional: Verify user ownership before updating
    if (req.session.user && productToUpdate.userId !== req.session.user.id) {
      console.warn("Unauthorized attempt to update product:", idToUpdate, "by user:", req.session.user.id);
      return res.status(403).send('Unauthorized to update this product');
    }

    // Basic validation (consider using express-validator middleware before this)
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      console.log("Validation errors during product update:", errores.array());
      // Re-render the edit form with errors and submitted data
      return res.render('products/productEdit', {
        title: 'Edit Product',
        product: { ...productToUpdate, ...req.body }, // Merge original data with submitted data
        errores: errores.mapped(),
        // Pass other necessary data for the form
      });
    }


    // Update product properties from req.body
    productToUpdate.name = req.body.name;
    productToUpdate.description = req.body.description;
    productToUpdate.price = Number(req.body.price);
    productToUpdate.cardId = req.body.cardId; // Assuming these can be updated
    productToUpdate.set = req.body.set;
    productToUpdate.cardNumber = req.body.cardNumber;
    productToUpdate.foilType = req.body.foilType;
    productToUpdate.rarity = req.body.rarity || 'Unknown'; // Assuming rarity can be updated or comes from form
    productToUpdate.updatedAt = new Date().toISOString();

    // Handle image update if using Multer
    if (req.file) {
      // Optional: Delete old image file
      // const oldImagePath = path.join(__dirname, '../public/images/cartasDb', productToUpdate.image);
      // // Add logic to avoid deleting default images or images from API if they are stored locally
      // if (productToUpdate.image && !productToUpdate.image.startsWith('http') && fs.existsSync(oldImagePath)) {
      //     try {
      //         fs.unlinkSync(oldImagePath);
      //         console.log("Deleted old product image:", oldImagePath);
      //     } catch (unlinkError) {
      //         console.error("Error deleting old product image:", unlinkError);
      //     }
      // }
      productToUpdate.image = '/images/cartasDb/' + req.file.filename; // Update image path to local file
      console.log("Product image updated:", productToUpdate.image);
    } else if (req.body.cardImage) {
      // If not using Multer for this update, but image URL comes from a field
      productToUpdate.image = req.body.cardImage;
      console.log("Product image updated from body field:", productToUpdate.image);
    }


    // Save the updated products array
    products[index] = productToUpdate; // Ensure the updated object replaces the old one
    writeFile(productsDirectory, stringifyFile(products));
    console.log("Product data saved after update.");

    res.redirect('/products/admin'); // Redirect to admin list after update
  },

  create: (req, res) => {
    console.log("Attempting to create product.");
    console.log("Create body:", req.body);
    console.log("Create file:", req.file); // If using Multer

    const products = parseFile(readFile(productsDirectory));
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      console.log("Validation errors during product creation:", errores.array());
      // Re-render the create form with errors and submitted data
      return res.render('products/productCreate', {
        title: 'Create New Product',
        errores: errores.mapped(),
        oldData: req.body // Pass submitted data back to pre-fill the form
      });
    }

    const newProduct = {
      id: products.length > 0 ? products[products.length - 1].id + 1 : 1, // Simple ID generation
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      // Handle image based on whether Multer was used or if it's a URL from a field
      image: req.file ? '/images/cartasDb/' + req.file.filename : (req.body.cardImage || 'default-product-image.jpg'), // Use uploaded file path, or cardImage field, or default
      cardId: req.body.cardId,
      set: req.body.set,
      cardNumber: req.body.cardNumber,
      foilType: req.body.foilType,
      userId: req.session.user.id, // Assign creator user ID
      rarity: req.body.rarity || 'Unknown',
      isNew: true, // Mark as new
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.push(newProduct);
    writeFile(productsDirectory, stringifyFile(products));
    console.log("New product created and saved:", newProduct.id, newProduct.name);

    res.redirect('/products/admin'); // Redirect to admin list after creation
  },

  add: (req, res) => {
    // This function just renders the form to create a product
    res.render('products/productCreate', {
      title: 'Create New Product',
      // You might need to pass other data like categories
      // categories: readJson('productCategories.json')
    });
  },
};

// Assuming this file exports both controllers, or you'll merge them
module.exports = {
  ...usersControllers,
  ...productsControllers
};
