

const selectProvincias = document.getElementById("provincia");

selectProvincias.addEventListener("change", async (e) => {
  console.log("valor captura del select", e.target.value); // Mostrar solo el valor seleccionado
  try {
    const response = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${e.target.value}&max=500`);

    if (!response.ok) { // Buena práctica: verificar si la respuesta HTTP fue exitosa
      console.error("Error al cargar localidades:", response.status, response.statusText);
      // Opcional: Mostrar un mensaje de error en la interfaz
      return; // Detener ejecución si hay error HTTP
    }

    const data = await response.json();

    if (!data.localidades || data.localidades.length === 0) { // Manejar si no hay localidades
      console.log("No se encontraron localidades para la provincia seleccionada.");
      const selectLocalidades = document.getElementById("localidad");
      selectLocalidades.innerHTML = "<option value=''>No hay localidades</option>"; // Limpiar y añadir opción por defecto
      return;
    }

    const localidades = data.localidades.sort((a, b) => a.nombre.localeCompare(b.nombre));
    const selectLocalidades = document.getElementById("localidad");

    selectLocalidades.innerHTML = ""; // Limpia las opciones anteriores

    // Opcional: Añadir una opción por defecto como "Seleccione una localidad"
    // const defaultOption = document.createElement("option");
    // defaultOption.value = "";
    // defaultOption.text = "Seleccione una localidad";
    // selectLocalidades.appendChild(defaultOption);


    localidades.forEach(municipio => {
      const option = document.createElement("option");
      option.value = municipio.id;
      option.text = municipio.nombre;
      selectLocalidades.appendChild(option);
    });

  } catch (error) { // === CORRECCIÓN AQUÍ ===
    console.error("Error en la petición Fetch o al procesar datos:", error); // Mostrar el error completo
    // Opcional: Mostrar un mensaje de error en la interfaz
    const selectLocalidades = document.getElementById("localidad");
    selectLocalidades.innerHTML = "<option value=''>Error al cargar</option>"; // Indicar error en el dropdown
  }
});

// Opcional: Disparar el evento 'change' al cargar la página
// Esto asegura que el select de localidades se llene la primera vez
// con las localidades de la provincia seleccionada por defecto en el EJS.
selectProvincias.dispatchEvent(new Event('change'));