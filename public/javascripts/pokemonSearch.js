document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const resultsContainer = document.getElementById("results");
  const form = document.querySelector(".needs-validation");

  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim().toLowerCase();

    if (query.length < 3) {
      resultsContainer.innerHTML = "";
      document.getElementById("cardName").classList.remove("is-invalid", "is-valid");
      document.getElementById("cardSet").classList.remove("is-invalid", "is-valid");
      document.getElementById("cardNumber").classList.remove("is-invalid", "is-valid");
      document.getElementById("cardFoil").classList.remove("is-invalid", "is-valid");
      document.getElementById("priceTrend").textContent = ""; // Limpiar el precio trend
      return;
    }

    try {
      const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:*${query}*`);
      const data = await response.json();
      const cards = data.data;

      resultsContainer.innerHTML = "";

      if (cards.length === 0) {
        resultsContainer.innerHTML = '<p class="text-danger">No se encontraron cartas.</p>';
        document.getElementById("cardName").classList.add("is-invalid");
        document.getElementById("cardSet").classList.add("is-invalid");
        document.getElementById("cardNumber").classList.add("is-invalid");
        document.getElementById("cardFoil").classList.add("is-invalid");
        document.getElementById("priceTrend").textContent = "N/A"; // Mostrar N/A si no hay cartas
        return;
      }

      cards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.className = "card-result shadow-sm p-2 d-flex align-items-center mb-2";
        cardElement.style.cursor = "pointer";

        cardElement.innerHTML = `
                    <img src="${card.images.small}" alt="${card.name}" class="me-3" width="60">
                    <div>
                        <h5 class="mb-1">${card.name}</h5>
                        <p class="mb-0 text-muted"><strong>Set:</strong> ${card.set.name}</p>
                    </div>
                `;

        cardElement.addEventListener("click", () => {
          document.getElementById("cardId").value = card.id;
          document.getElementById("cardName").value = card.name;
          document.getElementById("cardSet").value = card.set.name;
          document.getElementById("cardImage").value = card.images.small;
          document.getElementById("cardNumber").value = card.number;
          document.getElementById("cardFoil").value = card.rarity || 'N/A';

          document.getElementById("cardName").classList.remove("is-invalid");
          document.getElementById("cardName").classList.add("is-valid");
          document.getElementById("cardSet").classList.remove("is-invalid");
          document.getElementById("cardSet").classList.add("is-valid");
          document.getElementById("cardNumber").classList.remove("is-invalid");
          document.getElementById("cardNumber").classList.add("is-valid");
          document.getElementById("cardFoil").classList.remove("is-invalid");
          document.getElementById("cardFoil").classList.add("is-valid");

          // Mostrar el precio trend si está disponible
          if (card.cardmarket && card.cardmarket.prices && card.cardmarket.prices.averageSellPrice !== undefined) {
            document.getElementById("priceTrend").textContent = `Trend: $${card.cardmarket.prices.averageSellPrice.toFixed(2)}`;
          } else {
            document.getElementById("priceTrend").textContent = "Trend: N/A";
          }

          resultsContainer.innerHTML = "";
          searchInput.value = card.name;
        });

        resultsContainer.appendChild(cardElement);
      });
    } catch (error) {
      console.error("Error al obtener datos de la API:", error);
      resultsContainer.innerHTML = '<p class="text-danger">Ocurrió un error al buscar las cartas.</p>';
      document.getElementById("cardName").classList.add("is-invalid");
      document.getElementById("cardSet").classList.add("is-invalid");
      document.getElementById("cardNumber").classList.add("is-invalid");
      document.getElementById("cardFoil").classList.add("is-invalid");
      document.getElementById("priceTrend").textContent = "Trend: Error";
    }
  });

  form.addEventListener("submit", (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add("was-validated");

    const cardNameInput = document.getElementById("cardName");
    if (!cardNameInput.value.trim()) {
      cardNameInput.classList.add("is-invalid");
      event.preventDefault();
    }
  });
});