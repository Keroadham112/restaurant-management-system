// Admin page logic: list, add, edit, delete

const apiClient = window.AppAPI || window.apiClient;

function formatEGP(amount){
  const num = Number(amount) || 0;
  return num.toLocaleString('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 2 });
}

// Enhanced toast notifications for admin
function showAdminToast(message, type = 'success'){
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

// Form validation
function validateItemForm(formData) {
  const errors = [];
  
  if (!formData.get('name') || formData.get('name').trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!formData.get('category')) {
    errors.push('Category is required');
  }
  
  const price = Number(formData.get('price'));
  if (!price || price <= 0) {
    errors.push('Price must be a positive number');
  }
  
  if (!formData.get('description') || formData.get('description').trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }
  
  console.log('Validation errors:', errors);
  return errors;
}

function adminRenderItem(item){
  return `
    <div class="card mb-3" data-id="${item.id}">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-2">
            <img src="${item.image || 'https://via.placeholder.com/80x80?text=No+Image'}" 
                 class="img-fluid rounded" 
                 alt="${item.name}"
                 style="width: 80px; height: 80px; object-fit: cover;">
          </div>
          <div class="col-md-6">
            <h6 class="mb-1">${item.name}</h6>
            <small class="text-muted">${item.category} - ${formatEGP(item.price)}</small>
            <p class="small text-muted mb-0 mt-1">${item.description || 'No description'}</p>
            ${item.featured ? '<span class="badge bg-danger mt-1">Featured</span>' : ''}
          </div>
          <div class="col-md-4 text-end">
            <button class="btn btn-sm btn-outline-primary me-1 btn-edit">
              <i class="fas fa-edit me-1"></i>Edit
            </button>
            <button class="btn btn-sm btn-outline-danger btn-delete">
              <i class="fas fa-trash me-1"></i>Delete
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

async function initAdmin(){
  const listEl = document.getElementById('adminList');
  const addForm = document.getElementById('addForm');
  const loadingSpinner = document.getElementById('adminLoadingSpinner');
  if(!listEl || !addForm) return;

  // Show loading state
  function showLoading(show = true) {
    if (loadingSpinner) {
      loadingSpinner.style.display = show ? 'block' : 'none';
    }
    if (listEl) {
      listEl.style.display = show ? 'none' : 'block';
    }
  }

  async function load(){
    try{
      showLoading(true);
      console.log('Loading items...');
      const items = await apiClient.getItems();
      console.log('Items loaded:', items);
      listEl.innerHTML = items.map(adminRenderItem).join('') || '<div class="text-center py-4"><h5 class="text-muted">No items found</h5><p class="text-muted">Add your first item using the form above</p></div>';
      
      // attach handlers
        // Attach a single delegated click handler for edit/delete to avoid
        // re-attaching listeners every render and to ensure clicks are handled.
        if (!listEl.__delegatedListenerAdded) {
          listEl.addEventListener('click', async (e) => {
            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
              e.preventDefault();
              const card = deleteBtn.closest('.card');
              const id = deleteBtn.dataset.id || card?.dataset.id;
              const itemName = card?.querySelector('h6')?.textContent || '';
              if (!confirm(`Delete \"${itemName}\"?`)) return;
              try {
                await window.apiClient.deleteItem(id);
                showAdminToast(`\"${itemName}\" deleted`);
                loadItems();
              } catch (err) {
                showAdminToast('Delete failed: ' + (err.message || err), 'danger');
              }
              return;
            }

            const editBtn = e.target.closest('.btn-edit');
            if (editBtn) {
              e.preventDefault();
              const card = editBtn.closest('.card');
              const id = editBtn.dataset.id || card?.dataset.id;
              try {
                console.log('Edit clicked, id=', id);
                console.log('Current items count=', (window.appState && window.appState.items) ? window.appState.items.length : 'no appState');
                console.log('Items ids=', (window.appState && window.appState.items) ? window.appState.items.map(i=>i.id).slice(0,10) : []);
                const item = await window.apiClient.getItem(id);
                const modal = createEditModal(item);
                document.body.appendChild(modal);
                new bootstrap.Modal(modal).show();
                modal.addEventListener('hidden.bs.modal', () => modal.remove());
              } catch (err) {
                console.error('Edit handler error for id=', id, err);
                // Fallback: try to find item directly in appState (in-memory)
                if (id && window.appState && Array.isArray(window.appState.items)) {
                  const fallback = window.appState.items.find(i => String(i.id) === String(id));
                  if (fallback) {
                    console.log('Using fallback item from appState for id=', id);
                    const modal = createEditModal(fallback);
                    document.body.appendChild(modal);
                    new bootstrap.Modal(modal).show();
                    modal.addEventListener('hidden.bs.modal', () => modal.remove());
                    return;
                  }
                }
                showAdminToast('Failed to load item: ' + (err.message || err), 'danger');
              }
              return;
            }
          });
          listEl.__delegatedListenerAdded = true;
        }
    } catch(err){ 
      console.error(err); 
      showAdminToast('Failed to load items: ' + (err.message || 'Unknown error'), 'danger');
      listEl.innerHTML = '<div class="text-center py-4"><h5 class="text-danger">Error loading items</h5><p class="text-muted">Please try again later</p></div>';
    } finally {
      showLoading(false);
    }
  }

  // Enhanced form submission with validation
  console.log('Adding form submit listener to:', addForm);
  addForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    console.log('Form submitted');
    
    const submitBtn = addForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Adding...';
    
    try {
      const fd = new FormData(addForm);
      console.log('Form data:', Object.fromEntries(fd.entries()));
      
      // Validate form
      const errors = validateItemForm(fd);
      if (errors.length > 0) {
        console.log('Validation errors:', errors);
        showAdminToast('Validation errors: ' + errors.join(', '), 'danger');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
      }
      
      const payload = {
        name: fd.get('name').trim(),
        image: fd.get('image').trim() || 'https://via.placeholder.com/400x300?text=No+Image',
        category: fd.get('category'),
        price: Number(fd.get('price')),
        description: fd.get('description').trim(),
        ingredients: fd.get('ingredients').trim() || 'Not specified',
        featured: fd.get('featured') === 'on',
        tags: fd.get('tags') ? fd.get('tags').split(',').map(t => t.trim()).filter(t => t) : []
      };
      
      console.log('Payload created:', payload);
      console.log('Creating item with payload:', payload);
      const newItem = await apiClient.createItem(payload); 
      console.log('Item created:', newItem);
      showAdminToast(`"${payload.name}" added successfully`); 
      addForm.reset(); 
      // Reload the list
      console.log('Reloading list after item creation');
      await load(); 

      // last-added info stored in-memory by stateManager; no localStorage used here
    } catch(err){ 
      console.error('Error in form submission:', err); 
      showAdminToast('Add failed: ' + (err.message || 'Unknown error'), 'danger'); 
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  // Initial load
  console.log('Starting initial load');
  load();
  
  // Listen for reload events
  listEl.addEventListener('reload', () => {
    console.log('Reload event triggered');
    load();
  });

  // Re-load admin list when relevant item changes happen
  ['item:created', 'items:updated', 'item:deleted'].forEach(eventName => {
    window.addEventListener(eventName, () => {
      console.log(`${eventName} received, reloading admin list`);
      load();
    });
  });
}

// Create edit modal
function createEditModal(item) {
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Item</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form id="editForm">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Name *</label>
                  <input type="text" class="form-control" name="name" value="${item.name}" required>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Category *</label>
                  <select class="form-select" name="category" required>
                    <option value="Starters" ${item.category === 'Starters' ? 'selected' : ''}>Starters</option>
                    <option value="Main" ${item.category === 'Main' ? 'selected' : ''}>Main</option>
                    <option value="Desserts" ${item.category === 'Desserts' ? 'selected' : ''}>Desserts</option>
                    <option value="Drinks" ${item.category === 'Drinks' ? 'selected' : ''}>Drinks</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Price (EGP) *</label>
                  <input type="number" class="form-control" name="price" value="${item.price}" min="0" step="0.01" required>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Image URL</label>
                  <input type="url" class="form-control" name="image" value="${item.image || ''}">
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Description *</label>
              <textarea class="form-control" name="description" rows="3" required>${item.description || ''}</textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Ingredients</label>
              <input type="text" class="form-control" name="ingredients" value="${item.ingredients || ''}">
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" name="featured" ${item.featured ? 'checked' : ''}>
                  <label class="form-check-label">Featured Item</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Tags (comma-separated)</label>
                  <input type="text" class="form-control" name="tags" value="${(item.tags || []).join(', ')}" placeholder="e.g., veg, spicy, hot">
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="saveEditBtn">
            <i class="fas fa-save me-1"></i>Save Changes
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add save functionality
  modal.querySelector('#saveEditBtn').addEventListener('click', async () => {
    const form = modal.querySelector('#editForm');
    const fd = new FormData(form);
    
    const errors = validateItemForm(fd);
    if (errors.length > 0) {
      showAdminToast('Validation errors: ' + errors.join(', '), 'danger');
      return;
    }
    
    const saveBtn = modal.querySelector('#saveEditBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saving...';
    
    try {
      const payload = {
        name: fd.get('name').trim(),
        image: fd.get('image').trim() || 'https://via.placeholder.com/400x300?text=No+Image',
        category: fd.get('category'),
        price: Number(fd.get('price')),
        description: fd.get('description').trim(),
        ingredients: fd.get('ingredients').trim() || 'Not specified',
        featured: fd.get('featured') === 'on',
        tags: fd.get('tags') ? fd.get('tags').split(',').map(t => t.trim()).filter(t => t) : []
      };
      
      await apiClient.updateItem(item.id, payload);
      showAdminToast(`"${payload.name}" updated successfully`);
      
      const bsModal = bootstrap.Modal.getInstance(modal);
      bsModal.hide();
      
      // Reload the list
      setTimeout(() => {
        const listEl = document.getElementById('adminList');
        if (listEl) {
          const loadEvent = new Event('reload');
          listEl.dispatchEvent(loadEvent);
        }
      }, 500);
      
    } catch(err) {
      console.error(err);
      showAdminToast('Update failed: ' + (err.message || 'Unknown error'), 'danger');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  });
  
  return modal;
}

// Expose for inline scripts/fallbacks
window.createEditModal = createEditModal;

// Add refresh and export functionality
function addAdminEventListeners() {
  // Refresh button
  const refreshBtn = document.getElementById('refreshBtn');
  refreshBtn?.addEventListener('click', () => {
    console.log('Refresh button clicked');
    const listEl = document.getElementById('adminList');
    if (listEl) {
      const loadEvent = new Event('reload');
      listEl.dispatchEvent(loadEvent);
    }
  });

  // Export button
  const exportBtn = document.getElementById('exportBtn');
  exportBtn?.addEventListener('click', async () => {
    try {
      const items = await api.getItems();
      const csvContent = convertToCSV(items);
      downloadCSV(csvContent, 'keroo-menu-items.csv');
      showAdminToast('Items exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      showAdminToast('Export failed: ' + (error.message || 'Unknown error'), 'danger');
    }
  });
}

// Convert items to CSV format
function convertToCSV(items) {
  const headers = ['Name', 'Category', 'Price', 'Description', 'Ingredients', 'Featured', 'Tags'];
  const csvRows = [headers.join(',')];
  
  items.forEach(item => {
    const row = [
      `"${item.name || ''}"`,
      `"${item.category || ''}"`,
      item.price || 0,
      `"${(item.description || '').replace(/"/g, '""')}"`,
      `"${(item.ingredients || '').replace(/"/g, '""')}"`,
      item.featured ? 'Yes' : 'No',
      `"${(item.tags || []).join('; ')}"`
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

// Download CSV file
function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function initializeAdmin() {
  console.log('Initializing admin...');
  
  const listEl = document.getElementById('adminList');
  const addForm = document.getElementById('addForm');
  const refreshBtn = document.getElementById('refreshBtn');
  const exportBtn = document.getElementById('exportBtn');
  
  if (!listEl || !addForm) {
    console.error('Required elements not found');
    return;
  }
  
  // Load items function
  function loadItems() {
    if (!window.apiClient) {
      console.error('API not available');
      return;
    }
    
    window.apiClient.getItems().then(items => {
      console.log('Items loaded:', items.length);
      const html = items.map(item => {
        return `
          <div class="card mb-3" data-id="${item.id}">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-2">
                  <img src="${item.image || 'https://via.placeholder.com/80x80?text=No+Image'}" 
                       class="img-fluid rounded" 
                       alt="${item.name}"
                       style="width: 80px; height: 80px; object-fit: cover;">
                </div>
                <div class="col-md-6">
                  <h6 class="mb-1">${item.name}</h6>
                  <small class="text-muted">${item.category} - ${formatEGP(item.price)}</small>
                  <p class="small text-muted mb-0 mt-1">${item.description || 'No description'}</p>
                  ${item.featured ? '<span class="badge bg-danger mt-1">Featured</span>' : ''}
                </div>
                <div class="col-md-4 text-end">
                  <button class="btn btn-sm btn-outline-primary me-1 btn-edit" data-id="${item.id}">
                    <i class="fas fa-edit me-1"></i>Edit
                  </button>
                  <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${item.id}">
                    <i class="fas fa-trash me-1"></i>Delete
                  </button>
                </div>
              </div>
            </div>
          </div>`;
      }).join('');
      
      listEl.innerHTML = html || '<div class="alert alert-info">No items found</div>';
      
      // Attach handlers
      listEl.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          const id = this.dataset.id;
          const card = this.closest('.card');
          const itemName = card.querySelector('h6').textContent;
          
          if (confirm(`Delete "${itemName}"?`)) {
            window.apiClient.deleteItem(id).then(() => {
              showAdminToast(`"${itemName}" deleted`);
              loadItems();
            }).catch(err => {
              showAdminToast('Delete failed: ' + err.message, 'danger');
            });
          }
        });
      });
      
      listEl.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          const id = this.dataset.id;
          window.apiClient.getItem(id).then(item => {
            const modal = createEditModal(item);
            document.body.appendChild(modal);
            new bootstrap.Modal(modal).show();
            modal.addEventListener('hidden.bs.modal', () => modal.remove());
          }).catch(err => {
            showAdminToast('Failed to load item', 'danger');
          });
        });
      });
    }).catch(err => {
      console.error('Error loading items:', err);
      listEl.innerHTML = '<div class="alert alert-danger">Error loading items</div>';
    });
  }
  
  // Form submission
  addForm.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Form submitted');
    
    const submitBtn = addForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Adding...';
    
    try {
      const fd = new FormData(addForm);
      const errors = validateItemForm(fd);
      
      if (errors.length > 0) {
        showAdminToast('Validation errors: ' + errors.join(', '), 'danger');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
      }
      
      const payload = {
        name: fd.get('name').trim(),
        image: fd.get('image').trim() || 'https://via.placeholder.com/400x300?text=No+Image',
        category: fd.get('category'),
        price: Number(fd.get('price')),
        description: fd.get('description').trim(),
        ingredients: fd.get('ingredients').trim() || 'Not specified',
        featured: fd.get('featured') === 'on',
        tags: fd.get('tags') ? fd.get('tags').split(',').map(t => t.trim()).filter(t => t) : []
      };
      
      window.apiClient.createItem(payload).then(newItem => {
        console.log('Item created:', newItem);
        showAdminToast(`"${payload.name}" added successfully`);
        addForm.reset();
        loadItems();
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }).catch(err => {
        showAdminToast('Failed to add item: ' + err.message, 'danger');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
    } catch (err) {
      console.error('Form submission error:', err);
      showAdminToast('Error: ' + err.message, 'danger');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
  
  // Refresh button
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadItems);
  }
  
  // Export button
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      window.apiClient.getItems().then(items => {
        const csvContent = convertToCSV(items);
        downloadCSV(csvContent, 'keroo-menu-items.csv');
        showAdminToast('Items exported successfully');
      }).catch(err => {
        showAdminToast('Export failed: ' + err.message, 'danger');
      });
    });
  }
  
  // Listen for state changes
  window.addEventListener('item:created', loadItems);
  window.addEventListener('items:updated', loadItems);
  window.addEventListener('item:deleted', loadItems);
  
  // Initial load
  loadItems();
}

// Try to initialize immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAdmin);
} else {
  // DOM is already loaded
  initializeAdmin();
}
