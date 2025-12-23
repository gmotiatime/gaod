// Local Storage Adapter for DB
// Simulates a simple document store

const STORAGE_PREFIX = 'gaod_db_';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const localAdapter = {
  // --- SETTINGS (Key-Value) ---
  getSetting: async (key) => {
    await delay(50); // Sim latency
    return localStorage.getItem(key);
  },

  setSetting: async (key, value) => {
    await delay(50);
    localStorage.setItem(key, value);
    return true;
  },

  // --- USERS ---
  getUserByEmail: async (email) => {
    await delay(100);
    const users = JSON.parse(localStorage.getItem('brand_ai_users') || '[]');
    return users.find(u => u.email === email);
  },

  createUser: async (user) => {
    await delay(100);
    const users = JSON.parse(localStorage.getItem('brand_ai_users') || '[]');
    users.push(user);
    localStorage.setItem('brand_ai_users', JSON.stringify(users));
    return user;
  },

  updateUser: async (id, updates) => {
    await delay(50);
    const users = JSON.parse(localStorage.getItem('brand_ai_users') || '[]');
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem('brand_ai_users', JSON.stringify(users));
      return users[index];
    }
    return null;
  },

  // --- CHATS ---
  getChats: async (userId) => {
    await delay(50);
    const allChats = JSON.parse(localStorage.getItem('gaod_chats') || '[]');
    // Filter by owner
    return allChats.filter(c => c.userId === userId).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  createChat: async (chat) => {
    await delay(50);
    const allChats = JSON.parse(localStorage.getItem('gaod_chats') || '[]');
    allChats.push(chat);
    localStorage.setItem('gaod_chats', JSON.stringify(allChats));
    return chat;
  },

  updateChat: async (id, updates) => {
    await delay(50);
    const allChats = JSON.parse(localStorage.getItem('gaod_chats') || '[]');
    const index = allChats.findIndex(c => c.id === id);
    if (index !== -1) {
      allChats[index] = { ...allChats[index], ...updates };
      localStorage.setItem('gaod_chats', JSON.stringify(allChats));
      return allChats[index];
    }
    return null;
  },

  deleteChat: async (id) => {
    await delay(50);
    let allChats = JSON.parse(localStorage.getItem('gaod_chats') || '[]');
    allChats = allChats.filter(c => c.id !== id);
    localStorage.setItem('gaod_chats', JSON.stringify(allChats));
    return true;
  }
};
