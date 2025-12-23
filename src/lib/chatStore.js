const CHAT_STORAGE_KEY = 'brand_ai_chats';

export const chatStore = {
  // Get all chats (metadata)
  getChats: () => {
    const chats = localStorage.getItem(CHAT_STORAGE_KEY);
    return chats ? JSON.parse(chats) : [];
  },

  // Create a new chat
  createChat: (firstMessage = null) => {
    const chats = chatStore.getChats();
    const newChat = {
      id: Date.now().toString(),
      title: firstMessage ? firstMessage.substring(0, 30) + '...' : 'New Chat',
      createdAt: new Date().toISOString(),
      messages: firstMessage
        ? [{ id: Date.now(), role: 'user', content: firstMessage, timestamp: new Date().toISOString() }]
        : []
    };

    // Prepend to list
    chats.unshift(newChat);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
    return newChat;
  },

  // Get single chat details
  getChat: (chatId) => {
    const chats = chatStore.getChats();
    return chats.find(c => c.id === chatId) || null;
  },

  // Add message to chat
  addMessage: (chatId, role, content) => {
    const chats = chatStore.getChats();
    const chatIndex = chats.findIndex(c => c.id === chatId);

    if (chatIndex === -1) return null;

    const newMessage = {
      id: Date.now(),
      role,
      content,
      timestamp: new Date().toISOString()
    };

    chats[chatIndex].messages.push(newMessage);

    // Update title if it's the first message and title is generic
    if (chats[chatIndex].messages.length === 1 && chats[chatIndex].title === 'New Chat') {
       chats[chatIndex].title = content.substring(0, 30) + '...';
    }

    // Move to top
    const updatedChat = chats.splice(chatIndex, 1)[0];
    chats.unshift(updatedChat);

    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
    return updatedChat;
  },

  // Delete chat
  deleteChat: (chatId) => {
    const chats = chatStore.getChats();
    const newChats = chats.filter(c => c.id !== chatId);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newChats));
  },

  // Clear all
  clearAll: () => {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  }
};
