// Local API client that wraps the in-memory stateManager
(function(){
  function ensure() {
    if(!window.stateManager) throw new Error('stateManager not initialized');
    return window.stateManager;
  }

  const localApi = {
    getItems: (params) => {
      const sm = ensure();
      return sm.list(params);
    },
    getItem: (id) => {
      const sm = ensure();
      return sm.get(id).then(item => {
        if (!item) return Promise.reject(new Error('Item not found'));
        return item;
      });
    },
    createItem: (data) => {
      const sm = ensure();
      return sm.create(data);
    },
    updateItem: (id, data) => {
      const sm = ensure();
      return sm.update(id, data);
    },
    deleteItem: (id) => {
      const sm = ensure();
      return sm.remove(id);
    },
    getLastAdded: () => {
      const sm = ensure();
      return Promise.resolve(sm.lastAddedId || null);
    },
    getLastAddedCategory: () => {
      const sm = ensure();
      return Promise.resolve(sm.lastAddedCategory || null);
    },
    clearLastAdded: () => {
      const sm = ensure();
      sm.lastAddedId = null;
      sm.lastAddedCategory = null;
      return Promise.resolve();
    }
  };

  window.apiClientLocal = localApi;
})();
