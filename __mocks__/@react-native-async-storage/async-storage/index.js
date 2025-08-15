// Manual mock for @react-native-async-storage/async-storage
const store = new Map();
module.exports = {
  setItem: async (k,v) => { store.set(k,v); },
  getItem: async (k) => store.get(k) || null,
  removeItem: async (k) => { store.delete(k); },
  clear: async () => { store.clear(); },
};
