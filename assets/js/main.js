// Main client-side logic for index, menu, details pages
const apiClient = window.AppAPI;

function showToast(message, type = 'success'){
  const tId = 't'+Date.now();
  const toastHTML = `
    <div id="${tId}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`;
  const container = document.getElementById('toastContainer');
  if (!container) return;
  container.insertAdjacentHTML('beforeend', toastHTML);
  const toastEl = document.getElementById(tId);
  const bsToast = new bootstrap.Toast(toastEl, {
    autohide: true,
    delay: type === 'danger' ? 5000 : 3000
  });
  bsToast.show();
  toastEl.addEventListener('hidden.bs.toast', ()=> toastEl.remove());
}

// Normalize category names to a canonical set used in UI
function normalizeCategory(cat){
  const c = String(cat || '').trim().toLowerCase();
  if(!c) return '';
  if(['starter','starters'].includes(c)) return 'Starters';
  if(['main','mains','main dishes','main-dishes','main_dishes'].includes(c)) return 'Main';
  if(['dessert','desserts'].includes(c)) return 'Desserts';
  if(['drink','drinks','beverages'].includes(c)) return 'Drinks';
  return cat; // return original if unknown
}

// Loading spinner utility
function showLoading(element, show = true) {
  if (show) {
    element.innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="min-height: 200px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="ms-2">Loading...</span>
      </div>
    `;
  }
}

// Error handling utility
function handleError(error, defaultMessage = 'An error occurred') {
  console.error(error);
  const message = error.message || defaultMessage;
  showToast(message, 'danger');
}

function qs(name){
  return new URLSearchParams(location.search).get(name);
}

// Render helper for a card
function getItemImage(item) {
  // If the image is a full URL, use it directly
  if (item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'))) {
    return item.image;
  }
  
  // Fallback to placeholder
  let bgColor = '1a1a1a';
  let textColor = 'cccccc';
  let emoji = '🍽️';
  
  switch(item.category) {
    case 'Starters':
      emoji = '🥗';
      break;
    case 'Main':
      emoji = '🍖';
      break;
    case 'Desserts':
      emoji = '🍰';
      break;
    case 'Drinks':
      emoji = '🥤';
      break;
  }
  
  return `https://via.placeholder.com/400x300/${bgColor}/${textColor}?text=${emoji}+${encodeURIComponent(item.name)}`;
}

function renderCard(item){
  return `
    <div class="col-md-4 mb-4">
      <div class="card h-100">
        <div class="card-img-wrapper position-relative" style="height: 200px; overflow: hidden;">
          <img src="${getItemImage(item)}" 
               class="card-img-top" 
               alt="${item.name}"
               style="height: 100%; width: 100%; object-fit: cover;"
               onerror="this.onerror=null; this.src='${getItemImage({...item, image: null})}'">
          <div class="position-absolute top-0 start-0 p-2 d-flex gap-1 flex-wrap">
            ${renderBadges(item)}
          </div>
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-1">${item.name}</h5>
          <p class="card-text text-muted small mb-2">${item.description || ''}</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <div class="text-primary fw-bold">${formatEGP(item.price)}</div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-success add-to-cart-btn" data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}'>Add to Cart</button>
              <a href="details.html?id=${item.id}" class="btn btn-sm btn-outline-primary">Details</a>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderBadges(item){
  const badges = [];
  if(item.featured) badges.push('<span class="badge bg-danger me-1">Featured</span>');
  if(item.tags && item.tags.includes('spicy')) badges.push('<span class="badge bg-warning text-dark me-1">Spicy</span>');
  if(item.tags && item.tags.includes('veg')) badges.push('<span class="badge bg-success me-1">Veg</span>');
  if(item.tags && item.tags.includes('sweet')) badges.push('<span class="badge bg-secondary me-1">Sweet</span>');
  if(item.tags && item.tags.includes('hot')) badges.push('<span class="badge bg-danger me-1">Hot</span>');
  if(item.tags && item.tags.includes('cold')) badges.push('<span class="badge bg-info me-1">Cold</span>');
  return badges.join(' ');
}

// Central render function that updates common UI areas from in-memory state
async function renderItems(){
  try{
    const items = await apiClient.getItems();

    // update carousel and featured cards (index)
    const carouselInner = document.getElementById('carouselInner');
    const cardsEl = document.getElementById('featuredCards');
    const featured = items.filter(i => i.featured).slice(0,3);
    if(carouselInner) {
      carouselInner.innerHTML = featured.map((f, idx)=> `
        <div class="carousel-item ${idx===0? 'active':''}">
          <div class="position-relative">
            <img src="${getItemImage(f)}" class="d-block w-100" style="height:400px; object-fit:cover; filter:brightness(0.7)" alt="${f.name}"
                 onerror="this.onerror=null; this.src='${getItemImage({...f, image: null})}'">
            <div class="position-absolute top-50 start-50 translate-middle text-center w-75">
              <h2 class="display-4 text-white">${f.name}</h2>
              <p class="lead text-white">${f.description || ''}</p>
            </div>
          </div>
        </div>`).join('');
    }
    if(cardsEl){
      const top = items.filter(i=>i.featured).slice(0,6);
      cardsEl.innerHTML = top.map(renderCard).join('') || '<div class="col-12">لا توجد أطباق مميزة بعد</div>';
    }

    // update admin list if present
    const adminList = document.getElementById('adminList');
    if(adminList && typeof adminRenderItem === 'function'){
      adminList.innerHTML = items.map(adminRenderItem).join('') || '<div class="text-center py-4"><h5 class="text-muted">No items found</h5></div>';
    }

    // update menu grid if present (respect simple search/filter DOM state)
    const itemsGrid = document.getElementById('itemsGrid');
    if(itemsGrid){
      const searchInput = document.getElementById('searchInput');
      const sortSelect = document.getElementById('sortSelect');
      const priceFilter = document.getElementById('priceFilter');
      const tagsFilter = document.getElementById('tagsFilter');
      const categoryTabs = document.getElementById('categoryTabs');

      let filtered = items.slice();
      const q = searchInput?.value?.toLowerCase() || '';
      if(q) filtered = filtered.filter(i=> (i.name && i.name.toLowerCase().includes(q)) || (i.description && i.description.toLowerCase().includes(q)) || (i.ingredients && i.ingredients.toLowerCase().includes(q)));

      // category from active tab
      const activeTab = categoryTabs?.querySelector('button.active')?.dataset?.cat || '';
      if(activeTab) filtered = filtered.filter(i=> normalizeCategory(i.category) === activeTab);

      // price filter
      const priceVal = priceFilter?.value;
      if(priceVal === '0-100') filtered = filtered.filter(i => Number(i.price) >=0 && Number(i.price) <=100);
      else if(priceVal === '100-200') filtered = filtered.filter(i => Number(i.price) >=100 && Number(i.price) <=200);
      else if(priceVal === '200+') filtered = filtered.filter(i => Number(i.price) >=200);

      // tags
      const selectedTags = tagsFilter ? Array.from(tagsFilter.selectedOptions).map(o=>o.value) : [];
      if(selectedTags.length) filtered = filtered.filter(i => selectedTags.some(t => i.tags && i.tags.includes(t)));

      // sort
      const sort = sortSelect?.value;
      if(sort){
        if(sort === 'price-asc') filtered.sort((a,b)=> Number(a.price)-Number(b.price));
        else if(sort === 'price-desc') filtered.sort((a,b)=> Number(b.price)-Number(a.price));
      }

      itemsGrid.innerHTML = filtered.map(renderCard).join('') || '<div class="col-12 text-center py-4"><h5 class="text-muted">No items found</h5></div>';
    }

  }catch(err){ console.error('renderItems error', err); }
}

// Re-render on relevant item changes
['item:created', 'items:updated', 'item:deleted'].forEach(eventName => {
  window.addEventListener(eventName, ()=>{
    (async ()=>{ try{ await renderItems(); }catch(e){console.error(e);} })();
  });
});


// Index page: load featured items into carousel and cards
async function initIndex(){
  try{
    const items = await apiClient.getItems();
    const featured = items.filter(i => i.featured).slice(0,3);
    const carouselInner = document.getElementById('carouselInner');
    const cardsEl = document.getElementById('featuredCards');
    if(carouselInner && featured.length){
      carouselInner.innerHTML = featured.map((f, idx)=> `
        <div class="carousel-item ${idx===0? 'active':''}">
          <div class="position-relative">
            <img src="${getItemImage(f)}" class="d-block w-100" style="height:400px; object-fit:cover; filter:brightness(0.7)" alt="${f.name}"
                 onerror="this.onerror=null; this.src='${getItemImage({...f, image: null})}'">
            <div class="position-absolute top-50 start-50 translate-middle text-center w-75">
              <h2 class="display-4 text-white">${f.name}</h2>
              <p class="lead text-white">${f.description || ''}</p>
            </div>
          </div>
        </div>`).join('');
    }
    if(cardsEl){
      const top = items.filter(i=>i.featured).slice(0,6);
      cardsEl.innerHTML = top.map(renderCard).join('') || '<div class="col-12">لا توجد أطباق مميزة بعد</div>';
    }
  }catch(err){
    console.error(err); showToast('فشل تحميل الأصناف','danger');
  }
}

// Menu page: search, filter, render grid
async function initMenu(){
  const itemsGrid = document.getElementById('itemsGrid');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const categoryTabs = document.getElementById('categoryTabs');
  const priceFilter = document.getElementById('priceFilter');
  const tagsFilter = document.getElementById('tagsFilter');
  const spinner = document.getElementById('loadingSpinner');
  let currentCategory = '';
  let allItems = [];

  // Enhanced search and filter state
  let searchQuery = '';
  let priceRange = { min: 0, max: 1000 };
  let selectedTags = [];

  // tab handling
  categoryTabs?.querySelectorAll('button').forEach(b=> b.addEventListener('click', (e)=>{
    categoryTabs.querySelectorAll('button').forEach(x=> x.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.dataset.cat || '';
    console.log("Selected category:", currentCategory);
    loadAndRender();
  }));

  // Price filter handling
  priceFilter?.addEventListener('change', (e) => {
    const value = e.target.value;
    if (value === '0-100') priceRange = { min: 0, max: 100 };
    else if (value === '100-200') priceRange = { min: 100, max: 200 };
    else if (value === '200+') priceRange = { min: 200, max: 1000 };
    else priceRange = { min: 0, max: 1000 };
    loadAndRender();
  });

  // Tags filter handling
  tagsFilter?.addEventListener('change', (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    selectedTags = selectedOptions;
    loadAndRender();
  });

  async function loadAndRender(){
    try{
      // Show loading state
      if (spinner) spinner.classList.remove('d-none');
      if (itemsGrid) showLoading(itemsGrid, true);
      
      // Always reload items to ensure we have the latest data
      allItems = await apiClient.getItems();
      console.log("Loaded items:", allItems.length);
      console.log("Categories:", [...new Set(allItems.map(i => i.category))]);
      
      
      // Hide loading spinner
      if (spinner) spinner.classList.add('d-none');
      
      let filtered = [...allItems];
      
      // Apply search filter
      const q = searchInput?.value?.toLowerCase() || '';
      if(q) {
        filtered = filtered.filter(i=> 
          i.name && i.name.toLowerCase().includes(q) ||
          i.description && i.description.toLowerCase().includes(q) ||
          i.ingredients && i.ingredients.toLowerCase().includes(q)
        );
      }
      
      // Highlight last-added item (via apiClient)
      try {
        const lastIdHint = await apiClient.getLastAdded();
        const itemsGridEl = document.getElementById('itemsGrid');
        if (lastIdHint && itemsGridEl) {
          const link = itemsGridEl.querySelector(`a[href="details.html?id=${lastIdHint}"]`);
          const card = link ? link.closest('.col-md-4') : null;
          if (card) {
            card.classList.add('border','border-warning');
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          await apiClient.clearLastAdded();
        }
      } catch(err) { /* ignore */ }
      
      // Apply category filter
      if(currentCategory) {
        console.log("Filtering by category:", currentCategory);
        console.log("Available categories:", [...new Set(allItems.map(i => i.category))]);
        const targetCat = normalizeCategory(currentCategory);
        filtered = filtered.filter(i=> normalizeCategory(i.category) === targetCat);
      }
      
      // Apply price filter
      filtered = filtered.filter(i => {
        const price = Number(i.price) || 0;
        return price >= priceRange.min && price <= priceRange.max;
      });
      
      // Apply tags filter
      if (selectedTags.length > 0) {
        filtered = filtered.filter(i => {
          return selectedTags.some(tag => i.tags && i.tags.includes(tag));
        });
      }
      
      // Apply sorting
      const sort = sortSelect?.value;
      if(sort){
        if(sort === 'price-asc') filtered.sort((a,b)=> Number(a.price)-Number(b.price));
        else if(sort === 'price-desc') filtered.sort((a,b)=> Number(b.price)-Number(a.price));
        else if(sort === 'name-asc') filtered.sort((a,b)=> (a.name||'').localeCompare(b.name||''));
        else if(sort === 'name-desc') filtered.sort((a,b)=> (b.name||'').localeCompare(a.name||''));
        else if(sort === 'featured') filtered.sort((a,b)=> (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      }
      
      // Render results
      if (itemsGrid) {
        // If "All Items" is selected, group by category into sections
        if (!currentCategory) {
          const order = ['Starters', 'Main', 'Desserts', 'Drinks'];
          const categories = order.filter(cat => filtered.some(i => normalizeCategory(i.category) === cat));
          const otherItems = filtered.filter(i => !order.includes(normalizeCategory(i.category)));
          const sectionHTML = categories.map(cat => {
            const catItems = filtered.filter(i => normalizeCategory(i.category) === cat);
            const header = `<div class="col-12"><h4 class="mt-3 mb-3">${cat}</h4><hr></div>`;
            const cards = catItems.length ? catItems.map(renderCard).join('') : '<div class="col-12 text-muted">No items in this category</div>';
            return header + cards;
          }).join('') + (otherItems.length ? (`<div class=\"col-12\"><h4 class=\"mt-3 mb-3\">Other</h4><hr></div>` + otherItems.map(renderCard).join('')) : '');

          itemsGrid.innerHTML = sectionHTML || '<div class="col-12 text-center py-5"><h5 class="text-muted">No items found</h5><p class="text-muted">Try adjusting your search or filters</p></div>';
        } else {
          // Otherwise render flat list for the selected category
          itemsGrid.innerHTML = filtered.length > 0 
            ? filtered.map(renderCard).join('') 
            : '<div class="col-12 text-center py-5"><h5 class="text-muted">No items found</h5><p class="text-muted">Try adjusting your search or filters</p></div>';
        }
      }
      
    } catch(err) { 
      handleError(err, 'Failed to load items');
      if (spinner) spinner.classList.add('d-none');
      if (itemsGrid) {
        itemsGrid.innerHTML = '<div class="col-12 text-center py-5"><h5 class="text-danger">Error loading items</h5><p class="text-muted">Please try again later</p></div>';
      }
    }
  }

  // Enhanced search with debouncing
  searchInput?.addEventListener('input', debounce((e) => {
    searchQuery = e.target.value;
    loadAndRender();
  }, 300));
  
  sortSelect?.addEventListener('change', loadAndRender);

  // Clear filters functionality
  const clearFiltersBtn = document.getElementById('clearFilters');
  clearFiltersBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = '';
    if (priceFilter) priceFilter.value = '';
    if (tagsFilter) tagsFilter.value = '';
    currentCategory = '';
    priceRange = { min: 0, max: 1000 };
    selectedTags = [];
    
    // Reset category tabs
    categoryTabs?.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
    categoryTabs?.querySelector('button[data-cat=""]')?.classList.add('active');
    
    loadAndRender();
  });

  // prefill from query or focus last added item category
  let initialCategory = qs('category'); 
  if(!initialCategory){
    // try to focus the last-added category via apiClient
    try{
      const fromLast = await apiClient.getLastAddedCategory();
      if(fromLast){
        initialCategory = fromLast;
        // Clear filters so the new item isn't hidden
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = '';
        if (priceFilter) priceFilter.value = '';
        if (tagsFilter) {
          Array.from(tagsFilter.options).forEach(opt => opt.selected = false);
        }
        await apiClient.clearLastAdded();
      }
    }catch(err){ /* ignore */ }
  }
  if(initialCategory && categoryTabs) {
    const normalized = normalizeCategory(initialCategory);
    const categoryBtn = categoryTabs.querySelector(`button[data-cat="${normalized}"]`);
    if (categoryBtn) {
      categoryTabs.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
      categoryBtn.classList.add('active');
      currentCategory = normalized;
    }
  }
  
  loadAndRender();
}

// Details page
async function initDetails(){
  const id = qs('id');
  const target = document.getElementById('itemDetails');
  if(!id || !target) return;
  try{
    const item = await apiClient.getItem(id);
    target.innerHTML = `
      <div class="row g-4">
        <div class="col-md-6"><img src="${item.image||'https://via.placeholder.com/800x600'}" class="img-fluid rounded" alt="${item.name}"></div>
        <div class="col-md-6">
          <h3>${item.name}</h3>
          <p class="text-muted">${item.category} - $${item.price}</p>
          <p>${item.description || ''}</p>
          <p><strong>مكونات:</strong> ${item.ingredients || 'غير محدد'}</p>
          <button class="btn btn-primary" id="addToCartBtn">Add to Cart</button>
        </div>
      </div>`;

    document.getElementById('addToCartBtn').addEventListener('click', ()=>{
      const cart = JSON.parse(localStorage.getItem('cart')||'[]');
      cart.push(item);
      localStorage.setItem('cart', JSON.stringify(cart));
      showToast('تمت إضافة الصنف إلى السلة');
    });
  }catch(err){ console.error(err); showToast('فشل تحميل تفاصيل الصنف','danger'); }
}

// Utilities
function debounce(fn, ms=200){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), ms); }; }

// Cart functionality
function initCartFunctionality() {
  // Add to cart functionality for all add-to-cart buttons
  document.addEventListener('click', async function(e) {
    if (e.target.classList.contains('add-to-cart-btn')) {
      const itemData = e.target.getAttribute('data-item');
      if (itemData) {
        try {
          const item = JSON.parse(itemData);
          addToCart(item);
          e.target.innerHTML = 'تمت الإضافة ✓';
          e.target.classList.remove('btn-success');
          e.target.classList.add('btn-secondary');
          
          // Change back after 2 seconds
          setTimeout(() => {
            e.target.innerHTML = 'أضف للسلة';
            e.target.classList.remove('btn-secondary');
            e.target.classList.add('btn-success');
          }, 2000);
        } catch (err) {
          console.error('Error adding item to cart:', err);
          showToast('حدث خطأ أثناء إضافة المنتج للسلة', 'danger');
        }
      }

      // Highlight last added item if available (via apiClient)
      try {
        const lastId = await apiClient.getLastAdded();
        const itemsGridEl = document.getElementById('itemsGrid');
        if (lastId && itemsGridEl) {
          const cardLink = itemsGridEl.querySelector(`a[href="details.html?id=${lastId}"]`);
          const card = cardLink ? cardLink.closest('.col-md-4') : null;
          if (card) {
            card.classList.add('border','border-warning');
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          await apiClient.clearLastAdded();
        }
      } catch(err) { /* ignore */ }
    }
    
    // Remove from cart functionality
    if (e.target.classList.contains('remove-from-cart-btn')) {
      const itemId = e.target.getAttribute('data-item-id');
      if (itemId) {
        removeFromCart(itemId);
        showToast('تم إزالة المنتج من السلة');
        
        // If we're on a page with a cart display, refresh it
        const cartContainer = document.getElementById('cartContainer');
        if (cartContainer) {
          displayCart();
        }
      }
    }
  });
  
  // Cart icon click handler
  const cartLink = document.getElementById('cartLink');
  if (cartLink) {
    cartLink.addEventListener('click', function(e) {
      e.preventDefault();
      toggleCartModal();
    });
  }
  
  // Close cart modal when clicking outside
  document.addEventListener('click', function(e) {
    const cartModal = document.getElementById('cartModal');
    if (cartModal && !cartModal.contains(e.target) && e.target.id !== 'cartLink' && !e.target.closest('#cartLink')) {
      cartModal.remove();
    }
  });
}

// Calculate cart total
function calculateCartTotal() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  return cart.reduce((total, item) => total + (Number(item.price) * (item.quantity || 1)), 0);
}

// Toggle cart modal
function toggleCartModal() {
  // Remove existing modal if it exists
  const existingModal = document.getElementById('cartModal');
  if (existingModal) {
    existingModal.remove();
    return;
  }
  
  // Create cart modal
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartTotal = calculateCartTotal();
  
  // Create modal HTML
  const modalHTML = `
    <div id="cartModal" class="position-fixed top-0 end-0 p-3 bg-white shadow rounded" style="margin-top: 60px; width: 350px; max-height: 80vh; overflow-y: auto; z-index: 1050;">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Shopping Cart</h5>
        <button type="button" class="btn-close" id="closeCartModal"></button>
      </div>
      ${cart.length > 0 ? `
        <div class="list-group mb-3">
          ${cart.map(item => `
            <div class="list-group-item">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-0">${item.name}</h6>
                  <div class="d-flex align-items-center">
                    <small class="text-muted">${formatEGP(item.price)}</small>
                    ${item.quantity ? `<span class="badge bg-secondary ms-2">الكمية: ${item.quantity}</span>` : ''}
                  </div>
                  <small class="text-success">${item.quantity ? formatEGP(Number(item.price) * item.quantity) : formatEGP(item.price)}</small>
                </div>
                <button class="btn btn-sm btn-danger remove-from-cart-btn" data-item-id="${item.id}">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="card mb-3">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-0">Subtotal:</h6>
              <h6 class="mb-0">${formatEGP(cartTotal)}</h6>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-0">Tax (14%):</h6>
              <h6 class="mb-0">${formatEGP(cartTotal * 0.14)}</h6>
            </div>
            <hr>
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0 fw-bold">Total:</h5>
              <h5 class="mb-0 fw-bold text-primary">${formatEGP(cartTotal * 1.14)}</h5>
            </div>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-danger flex-grow-1" id="clearCartBtn">Clear Cart</button>
  <button class="btn btn-success flex-grow-1" id="checkoutBtn">Checkout</button>
        </div>
      ` : `
        <div class="text-center py-4">
          <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
          <p>Your cart is empty</p>
        </div>
      `}
    </div>
  `;
  
  // Append modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Add event listeners
  document.getElementById('closeCartModal').addEventListener('click', function() {
    document.getElementById('cartModal').remove();
  });
  
  // Add event listeners for remove from cart buttons
  const removeButtons = document.querySelectorAll('.remove-from-cart-btn');
  removeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const itemId = this.getAttribute('data-item-id');
      removeFromCart(itemId);
      // Refresh cart modal
      toggleCartModal();
      toggleCartModal();
    });
  });
  
  // Clear cart button
  const clearCartBtn = document.getElementById('clearCartBtn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', function() {
      localStorage.setItem('cart', '[]');
      updateCartCount();
      document.getElementById('cartModal').remove();
      showToast('تم إفراغ سلة التسوق');
    });
  }
  
  // Checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      document.getElementById('cartModal').remove();
      showCheckoutModal();
    });
  }
}

// Show checkout modal
function showCheckoutModal() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartTotal = calculateCartTotal();
  const taxAmount = cartTotal * 0.14;
  const totalWithTax = cartTotal + taxAmount;
  
  const modalHTML = `
    <div class="modal fade" id="checkoutModal" tabindex="-1" aria-labelledby="checkoutModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="checkoutModalLabel">إتمام الشراء</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-7">
                <h6 class="mb-3">معلومات الدفع</h6>
                <form id="paymentForm">
                  <div class="mb-3">
                    <label for="fullName" class="form-label">الاسم الكامل</label>
                    <input type="text" class="form-control" id="fullName" required>
                  </div>
                  <div class="mb-3">
                    <label for="address" class="form-label">العنوان</label>
                    <input type="text" class="form-control" id="address" required>
                  </div>
                  <div class="mb-3">
                    <label for="phone" class="form-label">رقم الهاتف</label>
                    <input type="tel" class="form-control" id="phone" required>
                  </div>
                  <div class="mb-3">
                    <label for="paymentMethod" class="form-label">طريقة الدفع</label>
                    <select class="form-select" id="paymentMethod" required>
                      <option value="">اختر طريقة الدفع</option>
                      <option value="cash">الدفع عند الاستلام</option>
                      <option value="card">بطاقة ائتمان</option>
                    </select>
                  </div>
                </form>
              </div>
              <div class="col-md-5">
                <h6 class="mb-3">ملخص الطلب</h6>
                <div class="card">
                  <div class="card-body">
                    <div class="d-flex justify-content-between mb-2">
                      <span>المجموع الفرعي:</span>
                      <span>${formatEGP(cartTotal)}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>الضريبة (14%):</span>
                      <span>${formatEGP(taxAmount)}</span>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between fw-bold">
                      <span>المجموع الكلي:</span>
                      <span class="text-primary">${formatEGP(totalWithTax)}</span>
                    </div>
                  </div>
                </div>
                <div class="mt-3">
                  <h6 class="mb-2">المنتجات (${cart.length})</h6>
                  <div class="list-group">
                    ${cart.map(item => `
                      <div class="list-group-item py-2">
                        <div class="d-flex justify-content-between">
                          <div>
                            <h6 class="mb-0">${item.name}</h6>
                            <small>${item.quantity ? `الكمية: ${item.quantity}` : 'الكمية: 1'}</small>
                          </div>
                          <span>${item.quantity ? formatEGP(Number(item.price) * item.quantity) : formatEGP(item.price)}</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
            <button type="button" class="btn btn-primary" id="confirmOrderBtn">تأكيد الطلب</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Append modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Show the modal
  const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
  checkoutModal.show();
  
  // Confirm order button
  document.getElementById('confirmOrderBtn').addEventListener('click', function() {
    const form = document.getElementById('paymentForm');
    if (form.checkValidity()) {
      // Hide the modal
      checkoutModal.hide();
      
      // Clear the cart
      localStorage.setItem('cart', '[]');
      updateCartCount();
      
      // Show success message
      showToast('تم تأكيد طلبك بنجاح! سيتم التواصل معك قريبًا.');
      
      // Remove the modal from DOM after hiding
      document.getElementById('checkoutModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
      });
    } else {
      // Trigger form validation
      form.reportValidity();
    }
  });
}

function addToCart(item) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
  
  if (existingItemIndex !== -1) {
    // Item exists, increment quantity if we had quantity property
    if (cart[existingItemIndex].quantity) {
      cart[existingItemIndex].quantity += 1;
    } else {
      // Add quantity property if it doesn't exist
      cart[existingItemIndex].quantity = 2;
    }
  } else {
    // Item doesn't exist, add it with quantity 1
    item.quantity = 1;
    cart.push(item);
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  showToast('تمت إضافة المنتج للسلة');
  
  // Update cart count in UI if we have a cart counter element
  updateCartCount();
}

function removeFromCart(itemId) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart = cart.filter(item => item.id !== itemId);
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count in UI
  updateCartCount();
}

function updateCartCount() {
  const cartCountElement = document.getElementById('cartCount');
  if (cartCountElement) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartCountElement.textContent = cart.length;
    
    // Show/hide based on items in cart
    if (cart.length > 0) {
      cartCountElement.classList.remove('d-none');
    } else {
      cartCountElement.classList.add('d-none');
    }
  }
}

// Auto-init depending on page
document.addEventListener('DOMContentLoaded', ()=>{
  if(document.getElementById('carouselInner')) initIndex();
  if(document.getElementById('itemsGrid')) initMenu();
  if(document.getElementById('itemDetails')) initDetails();
  
  // Initialize cart functionality on all pages
  initCartFunctionality();
  
  // Update cart count on page load
  updateCartCount();
});

function formatEGP(amount){
  const num = Number(amount) || 0;
  return num.toLocaleString('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 2 });
}

// Details page init uses English text for add to cart toast
async function initDetails(){
  const id = qs('id');
  const target = document.getElementById('itemDetails');
  if(!id || !target) return;
  try{
    const item = await apiClient.getItem(id);
    
    // Check if item is already in cart
    const cart = JSON.parse(localStorage.getItem('cart')||'[]');
    const isInCart = cart.some(cartItem => cartItem.id === item.id);
    
    target.innerHTML = `
      <div class="row g-4">
        <div class="col-md-6">
          <div class="card bg-dark">
            <img src="${getItemImage(item)}" class="img-fluid rounded" alt="${item.name}">
          </div>
        </div>
        <div class="col-md-6">
          <h3>${item.name}</h3>
          <p class="text-muted">${item.category} - ${formatEGP(item.price)}</p>
          <div class="mb-3">
            ${renderBadges(item)}
          </div>
          <p>${item.description || ''}</p>
          <p><strong>المكونات:</strong> ${item.ingredients || 'غير محدد'}</p>
          <div class="d-flex gap-2">
            ${isInCart ? 
              `<button class="btn btn-danger remove-from-cart-btn" data-item-id="${item.id}">Remove from Cart</button>` : 
              `<button class="btn btn-primary add-to-cart-btn" data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}'>Add to Cart</button>`
            }
          </div>
        </div>
      </div>`;
  }catch(err){ console.error(err); showToast('فشل تحميل تفاصيل المنتج','danger'); }
}
