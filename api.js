// API wrapper using Axios with an in-memory fallback seed when API_BASE is empty.
// IMPORTANT: set API_BASE to your mockapi.io base endpoint if you want a remote backend.
// Example: const API_BASE = 'https://64abcd1234.mockapi.io';
const API_BASE = "";// <-- Put your mockapi.io base URL here. If empty, the in-memory fallback will be used.

function fullUrl(path) {
  return API_BASE + path;
}

// Seed data (used when API_BASE is empty). Images reference assets/images/ (you can add these files).
const SEED_ITEMS = [
  // Starters
  { id: '1', name: 'Hummus Starter', category: 'Starters', price: 100, image: 'https://media.istockphoto.com/id/2213689776/photo/hummus-in-bowl-houmous-dip-chickpea-humus-tahini-sauce-middle-eastern-spread.jpg?s=2048x2048&w=is&k=20&c=qnWfE75V8HB9VPlvksRNX903yOzuwjDn3rnsgrWpzBo=', description: 'Creamy hummus with olive oil and lemon', ingredients: 'Chickpeas, tahini, olive oil, lemon, garlic', featured: true, tags: ['veg'] },
  { id: '2', name: 'Fattoush Salad', category: 'Starters', price: 110, image: 'https://plus.unsplash.com/premium_photo-1664392068994-9277c9ed4837?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=757', description: 'Fresh mixed salad with toasted bread and pomegranate dressing', ingredients: 'Lettuce, cucumber, tomato, toasted bread, dressing', featured: false, tags: ['veg'] },

  // Mains (6)
  { id: '3', name: 'Chicken Shawarma', category: 'Main', price: 150, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=640', description: 'Grilled chicken shawarma with special sauce', ingredients: 'Chicken, spices, bread, sauce', featured: true, tags: ['hot'] },
  { id: '4', name: 'Cheeseburger', category: 'Main', price: 160, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=640', description: 'Beef burger with cheddar, lettuce and tomato', ingredients: 'Beef, cheese, bun, lettuce, tomato', featured: false, tags: ['hot'] },
  { id: '5', name: 'Chicken Kabsa', category: 'Main', price: 170, image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=640', description: 'Spiced rice with chicken pieces', ingredients: 'Rice, chicken, spices', featured: false, tags: ['hot', 'spicy'] },
  { id: '6', name: 'Alfredo Pasta with Chicken', category: 'Main', price: 140, image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=640', description: 'Pasta tossed in creamy Alfredo sauce with chicken', ingredients: 'Pasta, chicken, cream, cheese', featured: false, tags: ['hot'] },
  { id: '7', name: 'Lamb Mandi', category: 'Main', price: 200, image: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=640', description: 'Traditional mandi with tender lamb and aromatic rice', ingredients: 'Lamb, rice, mandi spices', featured: true, tags: ['hot', 'spicy'] },
  { id: '8', name: 'Grilled Fish', category: 'Main', price: 180, image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=640', description: 'Grilled sea fish with spices and lemon', ingredients: 'Fish, spices, lemon', featured: false, tags: ['hot'] },

  // Desserts (6)
  { id: '9', name: 'Kunafa with Cream', category: 'Desserts', price: 120, image: 'https://media.istockphoto.com/id/2201053247/photo/turkish-dessert-kunefe-kunafa-kadayif-with-pistachio.jpg?s=2048x2048&w=is&k=20&c=jsspV4Sbfs6XwBJavGY5cr1RqwHxVX2AD89sWdgEvp8=', description: 'Hot kunafa served with cream and syrup', ingredients: 'Kunafa, cream, syrup', featured: true, tags: ['sweet', 'hot'] },
  { id: '10', name: 'Vanilla Ice Cream', category: 'Desserts', price: 100, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=640', description: 'Smooth vanilla ice cream with chocolate sauce', ingredients: 'Milk, sugar, vanilla', featured: false, tags: ['cold', 'sweet'] },
  { id: '11', name: 'Baklava', category: 'Desserts', price: 110, image: 'https://plus.unsplash.com/premium_photo-1667545476423-21bd39236df1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1173', description: 'Layers of pastry filled with nuts and honey', ingredients: 'Pastry, nuts, honey', featured: false, tags: ['sweet'] },
  { id: '12', name: 'Om Ali', category: 'Desserts', price: 115, image: 'https://media.istockphoto.com/id/2191027680/photo/traditional-egyptian-dessert-umm-ali.jpg?s=1024x1024&w=is&k=20&c=FJl9PhyWWi1RVAW3hDJCe-7HH-hWl558QJnOWZLWORw=', description: 'Traditional Om Ali dessert with nuts', ingredients: 'Milk, pastry, nuts, raisins', featured: false, tags: ['sweet', 'hot'] },
  { id: '13', name: 'Chocolate Cake', category: 'Desserts', price: 130, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=640', description: 'Rich chocolate cake with intense flavor', ingredients: 'Flour, sugar, chocolate', featured: false, tags: ['sweet'] },
  { id: '14', name: 'Cheesecake', category: 'Desserts', price: 140, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=640', description: 'Creamy cheesecake with strawberry sauce', ingredients: 'Cream cheese, biscuit, sugar', featured: false, tags: ['sweet', 'cold'] },

  // Drinks (6)
  { id: '15', name: 'Lemon Mint Juice', category: 'Drinks', price: 100, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=640', description: 'Fresh lemon juice with mint and sugar', ingredients: 'Lemon, mint, sugar', featured: false, tags: ['cold', 'veg'] },
  { id: '16', name: 'Turkish Coffee', category: 'Drinks', price: 100, image: 'https://images.unsplash.com/photo-1669809374019-9a9d02b0e10d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170', description: 'Traditional finely ground Turkish coffee', ingredients: 'Coffee, sugar (optional)', featured: false, tags: ['hot'] },
  { id: '17', name: 'Fresh Mango Juice', category: 'Drinks', price: 120, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=640', description: 'Fresh mango juice without additives', ingredients: 'Mango, water, sugar', featured: false, tags: ['cold', 'veg'] },
  { id: '18', name: 'Virgin Mojito', category: 'Drinks', price: 110, image: 'https://plus.unsplash.com/premium_photo-1722194069219-16ec49c08625?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687', description: 'Refreshing mint and lime mocktail', ingredients: 'Mint, lime, sugar, soda', featured: false, tags: ['cold'] },
  { id: '19', name: 'Green Tea', category: 'Drinks', price: 80, image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=640', description: 'Refreshing green tea with mint leaves', ingredients: 'Green tea, mint, hot water', featured: false, tags: ['hot', 'veg'] },
  { id: '20', name: 'Orange Juice', category: 'Drinks', price: 90, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=640', description: 'Freshly squeezed orange juice', ingredients: 'Oranges, sugar (optional)', featured: true, tags: ['cold', 'veg'] }
];

// Simple in-memory store with localStorage persistence when API_BASE is empty
const MemoryStore = (function(){
  const LS_KEY = 'menu_items';

  function loadFromStorage(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        if(Array.isArray(parsed)) return parsed;
      }
    }catch(err){
      console.warn('Failed to read items from localStorage:', err);
    }
    // fallback to seed if nothing stored
    return JSON.parse(JSON.stringify(SEED_ITEMS));
  }

  function saveToStorage(items){
    try{
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    }catch(err){
      console.warn('Failed to save items to localStorage:', err);
    }
  }

  let items = loadFromStorage();

  return {
    list: (params = {}) => {
      // Reload from localStorage each time to reflect latest changes
      items = loadFromStorage();
      // naive filter by name/category
      let res = items.slice();
      if(params.name){ res = res.filter(i=> i.name && i.name.toLowerCase().includes(String(params.name).toLowerCase())); }
      if(params.category){ res = res.filter(i=> i.category === params.category); }
      return Promise.resolve(res);
    },
    get: (id) => Promise.resolve(items.find(i=> i.id === String(id)) || null),
    create: (data) => {
      const nid = String(Date.now());
      const newItem = Object.assign({ id: nid }, data);
      items.unshift(newItem);
      saveToStorage(items);
      return Promise.resolve(newItem);
    },
    update: (id, data) => {
      const idx = items.findIndex(i=> i.id === String(id));
      if(idx===-1) return Promise.reject(new Error('Not found'));
      items[idx] = Object.assign({}, items[idx], data);
      saveToStorage(items);
      return Promise.resolve(items[idx]);
    },
    remove: (id) => {
      const idx = items.findIndex(i=> i.id === String(id));
      if(idx===-1) return Promise.reject(new Error('Not found'));
      const removed = items.splice(idx,1)[0];
      saveToStorage(items);
      return Promise.resolve(removed);
    }
  };
})();

const api = {
  getItems: async (params = {}) => {
    try {
      if(!API_BASE) {
        console.log('Using MemoryStore for getItems');
        return await MemoryStore.list(params);
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
      if(!API_BASE) return await MemoryStore.get(id);
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
        console.log('Using MemoryStore for createItem');
        return await MemoryStore.create(data);
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
      
      if(!API_BASE) return await MemoryStore.update(id, data);
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
        console.log('Using MemoryStore for deleteItem');
        return await MemoryStore.remove(id);
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
};

// Export for browsers (simple)
window.AppAPI = api;

// Also expose seed list for debugging
window.__SEED_ITEMS = SEED_ITEMS;
