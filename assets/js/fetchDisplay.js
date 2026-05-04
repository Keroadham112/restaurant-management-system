(function () {
    async function fetchAndRenderFoodItems() {
        const container = document.getElementById('food-items');
        if (!container) return;

        container.innerHTML = '<p>Loading items...</p>';

        try {
            const res = await fetch('http://localhost:5000/api/food');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const json = await res.json();
            if (!json || !json.success || !Array.isArray(json.data)) {
                container.innerHTML = '<p>No items available.</p>';
                return;
            }

            const items = json.data;
            if (items.length === 0) {
                container.innerHTML = '<p>No items available.</p>';
                return;
            }

            const fragment = document.createDocumentFragment();

            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'food-item card mb-3';
                card.style.maxWidth = '540px';

                const row = document.createElement('div');
                row.className = 'row g-0 align-items-center';

                const imgCol = document.createElement('div');
                imgCol.className = 'col-auto';

                const img = document.createElement('img');
                img.className = 'img-fluid rounded-start';
                img.alt = item.name || 'Food image';
                img.width = 120;
                img.onerror = function() { this.src = 'assets/images/placeholder.png'; };
                img.src = item.image || 'assets/images/placeholder.png';

                imgCol.appendChild(img);

                const bodyCol = document.createElement('div');
                bodyCol.className = 'col';

                const body = document.createElement('div');
                body.className = 'card-body';

                const title = document.createElement('h5');
                title.className = 'card-title mb-1';
                title.textContent = item.name || 'Unnamed item';

                const desc = document.createElement('p');
                desc.className = 'card-text text-muted mb-1';
                desc.textContent = item.description || '';

                const price = document.createElement('p');
                price.className = 'card-text fw-bold mb-0';
                price.textContent = (typeof item.price === 'number' ? item.price : (item.price || '')) + ' EGP';

                body.appendChild(title);
                body.appendChild(desc);
                body.appendChild(price);
                bodyCol.appendChild(body);

                row.appendChild(imgCol);
                row.appendChild(bodyCol);
                card.appendChild(row);

                fragment.appendChild(card);
            });

            // Clear and append
            container.innerHTML = '';
            container.appendChild(fragment);

        } catch (err) {
            console.error('Failed to fetch food items', err);
            container.innerHTML = '<p class="text-danger">Failed to load items.</p>';
        }
    }

    // Auto-run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchAndRenderFoodItems);
    } else {
        fetchAndRenderFoodItems();
    }

    // Expose function globally if needed
    window.fetchAndRenderFoodItems = fetchAndRenderFoodItems;
})();
