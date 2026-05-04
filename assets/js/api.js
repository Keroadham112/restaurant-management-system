// API wrapper using Axios with an in-memory fallback seed when API_BASE is empty.
// IMPORTANT: set API_BASE to your mockapi.io base endpoint if you want a remote backend.
// Example: const API_BASE = 'https://64abcd1234.mockapi.io';
const API_BASE = "";// <-- Put your mockapi.io base URL here. If empty, the in-memory fallback will be used.

function fullUrl(path) {
  return API_BASE + path;
}

// NOTE: seed data moved to assets/js/state.js and centralized in window.appState

// In-memory state is managed in assets/js/state.js via window.stateManager

const api = {
  getItems: async (params = {}) => {
    try {
      if(!API_BASE) {
        console.log('Using localApi (in-memory) for getItems');
        return await window.apiClientLocal.getItems(params);
      }
      const response = await axios.get(fullUrl('/foods'), { 
        params,
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('API Response:', response.data);
      // Ensure all items have required fields
      const items = response.data.map(item => ({
        id: item.id || String(Date.now() + Math.random()),
        name: item.name || 'Unknown Item',
        category: item.category || 'Other',
        price: Number(item.price) || 0,
        image: item.image || 'https://via.placeholder.com/400x300?text=No+Image',
        description: item.description || 'No description available',
        ingredients: item.ingredients || 'Not specified',
        featured: item.featured || false,
        tags: item.tags || []
      }));
      console.log('Processed items:', items);
      return items;
    } catch (error) {
      console.error('Error fetching items:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw new Error(`Failed to fetch items: ${error.response?.data?.message || error.message}`);
    }
  },
  
  getItem: async (id) => {
    try {
      if(!API_BASE) return await window.apiClientLocal.getItem(id);
      const response = await axios.get(fullUrl(`/foods/${id}`), {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Fetched item:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching item:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      if (error.response?.status === 404) {
        throw new Error('Item not found');
      }
      throw new Error(`Failed to fetch item: ${error.response?.data?.message || error.message}`);
    }
  },
  
  createItem: async (data) => {
    try {
      // Validate required fields
      if (!data.name || !data.category || !data.price) {
        throw new Error('Name, category, and price are required');
      }
      
      if(!API_BASE) {
        console.log('Using localApi (in-memory) for createItem');
        return await window.apiClientLocal.createItem(data);
      }
      const response = await axios.post(fullUrl('/foods'), data, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Created item:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating item:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      if (error.response?.status === 400) {
        throw new Error('Invalid data provided');
      }
      throw new Error(`Failed to create item: ${error.response?.data?.message || error.message}`);
    }
  },
  
  updateItem: async (id, data) => {
    try {
      if (!id) {
        throw new Error('Item ID is required');
      }
      
      if(!API_BASE) return await window.apiClientLocal.updateItem(id, data);
      const response = await axios.put(fullUrl(`/foods/${id}`), data, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Updated item:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating item:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      if (error.response?.status === 404) {
        throw new Error('Item not found');
      }
      if (error.response?.status === 400) {
        throw new Error('Invalid data provided');
      }
      throw new Error(`Failed to update item: ${error.response?.data?.message || error.message}`);
    }
  },
  
  deleteItem: async (id) => {
    try {
      if (!id) {
        throw new Error('Item ID is required');
      }
      
      if(!API_BASE) {
        console.log('Using localApi (in-memory) for deleteItem');
        return await window.apiClientLocal.deleteItem(id);
      }
      const response = await axios.delete(fullUrl(`/foods/${id}`), {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Deleted item:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting item:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      if (error.response?.status === 404) {
        throw new Error('Item not found');
      }
      throw new Error(`Failed to delete item: ${error.response?.data?.message || error.message}`);
    }
  },
  
  // Search functionality with advanced filtering
  searchItems: async (query = '', filters = {}) => {
    try {
      const params = {
        name: query,
        ...filters
      };
      return await api.getItems(params);
    } catch (error) {
      console.error('Error searching items:', error);
      throw new Error('Search failed. Please try again.');
    }
  }
  ,
  // Helpers to surface last-added hints from in-memory stateManager
  getLastAdded: async () => {
    if(!API_BASE) return await window.apiClientLocal.getLastAdded();
    return Promise.resolve(null);
  },
  getLastAddedCategory: async () => {
    if(!API_BASE) return await window.apiClientLocal.getLastAddedCategory();
    return Promise.resolve(null);
  },
  clearLastAdded: async () => {
    if(!API_BASE) return await window.apiClientLocal.clearLastAdded();
    return Promise.resolve();
  }
};

// Export for browsers (simple)
window.AppAPI = api;
window.apiClient = api;

// Note: seed moved to window.appState in assets/js/state.js
