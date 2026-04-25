// Admin page logic: list, add, edit, delete


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
      const items = await api.getItems();
      console.log('Items loaded:', items);
      listEl.innerHTML = items.map(adminRenderItem).join('') || '<div class="text-center py-4"><h5 class="text-muted">No items found</h5><p class="text-muted">Add your first item using the form above</p></div>';
      
      // attach handlers
      console.log('Attaching delete handlers to', listEl.querySelectorAll('.btn-delete').length, 'delete buttons');
      listEl.querySelectorAll('.btn-delete').forEach(b=> b.addEventListener('click', async (e)=>{
        const card = e.target.closest('.card');
        const id = card.dataset.id;
        const itemName = card.querySelector('h6').textContent;
        
        if(!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) return;
        
        try{ 
          console.log('Deleting item with id:', id);
          await api.deleteItem(id); 
          console.log('Item deleted successfully');
          showAdminToast(`"${itemName}" deleted successfully`); 
          await load(); 
        } catch(err){ 
          console.error(err); 
          showAdminToast('Delete failed: ' + (err.message || 'Unknown error'), 'danger'); 
        }
      }));
      
      listEl.querySelectorAll('.btn-edit').forEach(b=> b.addEventListener('click', async (e)=>{
        const card = e.target.closest('.card');
        const id = card.dataset.id;
        
        try {
          const item = await api.getItem(id);
          // Enhanced edit form
          const editModal = createEditModal(item);
          document.body.appendChild(editModal);
          const bsModal = new bootstrap.Modal(editModal);
          bsModal.show();
          
          editModal.addEventListener('hidden.bs.modal', () => {
            editModal.remove();
          });
        } catch(err) {
          console.error(err);
          showAdminToast('Failed to load item for editing', 'danger');
        }
      }));
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
      const newItem = await api.createItem(payload); 
      console.log('Item created:', newItem);
      showAdminToast(`"${payload.name}" added successfully`); 
      addForm.reset(); 
      // Reload the list
      console.log('Reloading list after item creation');
      await load(); 

      // Persist last added info for Menu page to focus/show
      try {
        localStorage.setItem('__last_added_category', payload.category);
        localStorage.setItem('__last_added_id', String(newItem.id));
      } catch(err) {
        console.warn('Failed to persist last added info:', err);
      }
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
      
      await api.updateItem(item.id, payload);
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

document.addEventListener('DOMContentLoaded', ()=> {
  console.log('Admin page loaded');
  initAdmin();
  addAdminEventListeners();
});
