// Lógica para agregar a favoritos

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('addCarrito');
    if (btn) {
        btn.addEventListener('click', async function() {
            const productId = btn.dataset.productId;
            const userId = btn.dataset.userId;
            if (!productId || !userId) {
                alert('Faltan datos para agregar a favoritos.');
                return;
            }
            try {
                const res = await fetch('/users/favorites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productId, userId })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('Agregado a favoritos');
                } else {
                    alert(data.message || 'Error al agregar a favoritos');
                }
            } catch (e) {
                alert('Error de red al agregar a favoritos');
            }
        });
    }
});