## Componentes Principales de la Base de Datos

La base de datos de este ecommerce se compone de las siguientes tablas, cada una diseñada para almacenar información específica:

* **`roles` (Roles):** Almacena los diferentes roles de usuario dentro del sistema (ej: `admin`, `user`). Cada rol tiene un `role_id` único y un `role_name`.

* **`customers` (Clientes):** Contiene la información de los clientes registrados: `first_name`, `last_name`, `email` (único), `password`, `address`, `phone_number`, `registration_date`, y se relaciona con la tabla `roles` a través de `role_id` para determinar el tipo de usuario.

* **`purchase_history` (Historial de Compras):** Registra cada compra realizada, incluyendo un `purchase_id` único, el `customer_id` del comprador, la `purchase_date` y el `total_amount`.

* **`products` (Productos):** Almacena la información general de todos los productos a la venta: `product_id` (único), `name`, `description`, `price`, `stock`, `publication_date`, y el `product_type` (`tcg` u `others`).

* **`subproducts` (Subproductos):** Proporciona detalles específicos sobre el tipo de cada producto (`subproduct_type`: `card`, `expansion`, `clothing`, `toy`, `accessory`). Para las cartas (`card`), se relaciona con `pokemon_cards_catalog` a través de `card_catalog_id`. Para las expansiones (`expansion`), se relaciona con `tcg_expansions` (si se utiliza).

* **`published_products` (Productos Publicados):** Lleva un registro de qué productos han sido publicados por cada cliente (`customer_id`) o administrador, guardando el `product_id`, el `customer_id` del publicador y la `publication_date`.

* **`pokemon_types` (Tipos de Pokémon):** Lista los diferentes tipos de Pokémon (ej: `Fire`, `Water`, `Electric`), con un `type_id` único y un `type_name`.

* **`purchase_details` (Detalles de Compra):** Detalla los ítems incluidos en cada compra, conectando `purchase_id` (de `purchase_history`) y `product_id` (de `products`), junto con la `quantity` y el `unit_price` al momento de la compra.

* **`pokemon_sets` (Sets de Pokémon):** Almacena la información general de los sets de cartas Pokémon obtenidos de la API, identificados por un `set_id_api` único, incluyendo el `set_name`, `series`, `release_date`, etc.

* **`pokemon_cards_catalog` (Catálogo de Cartas Pokémon):** Contiene la información detallada de cada carta Pokémon obtenida de la API, con un `card_catalog_id` único, y campos como `card_name`, `supertype`, `subtypes`, `level`, `hp`, `types`, `attacks`, `weaknesses`, `rarity`, URLs de imágenes, precios, y se relaciona con `pokemon_sets` a través de `set_id_api`.

* **`card_types` (Tipos de Carta):** Establece una relación muchos a muchos entre las cartas Pokémon (en `pokemon_cards_catalog` a través de `card_id`) y los tipos de Pokémon (en `pokemon_types` a través de `type_id`).

* **`tcg_expansions` (Expansiones TCG - Opcional):** Almacena información específica sobre las expansiones de cartas Pokémon (`expansion_name`, `expansion_code`, `release_date`).

* **`product_images` (Imágenes de Producto - Opcional):** Permite asociar múltiples imágenes (`image_url`) a cada producto (`product_id`), con un `image_order` para especificar el orden de visualización.

* **`product_categories` (Categorías de Producto - Opcional):** Define categorías para los productos (`category_name`).

* **`product_category` (Categoría de Producto - Opcional):** Conecta los productos (`product_id`) con las categorías (`category_id`), permitiendo que un producto pertenezca a varias categorías.

## Funcionamiento y Conexiones

El sistema de base de datos es relacional, lo que significa que las tablas están conectadas entre sí a través de **claves foráneas** (`FOREIGN KEY`). Estas conexiones permiten relacionar la información almacenada en diferentes tablas. Algunos ejemplos de estas relaciones son:

* La tabla `customers` utiliza la columna `role_id` como clave foránea para referenciar la tabla `roles`, determinando el rol de cada cliente.
* La tabla `purchase_history` utiliza `customer_id` como clave foránea para vincular cada compra al cliente que la realizó en la tabla `customers`.
* La tabla `purchase_details` utiliza `purchase_id` y `product_id` como claves foráneas para conectar los detalles de cada compra con la compra en sí (`purchase_history`) y con los productos comprados (`products`).
* Para las cartas Pokémon, la tabla `subproducts` utiliza `card_catalog_id` como clave foránea para acceder a la información detallada de la carta en la tabla `pokemon_cards_catalog`. La tabla `card_types` utiliza `card_id` y `type_id` como claves foráneas para relacionar las cartas con sus tipos.

Este sistema de relaciones asegura la integridad de los datos y permite realizar consultas complejas para obtener información relevante para la gestión del ecommerce.