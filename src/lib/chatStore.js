import { db } from './db';

export const chatStore = {
  getChats: async (userId) => {
    if (!userId) {
        const session = localStorage.getItem('brand_ai_session');
        if (session) {
            const user = JSON.parse(session);
            userId = user.id;
        }
    }

    if (!userId) return [];

    return await db.getChats(userId);
  },

  createChat: async (firstMessage = null, userId) => {
    if (!userId) {
        const session = localStorage.getItem('brand_ai_session');
        if (session) {
            const user = JSON.parse(session);
            userId = user.id;
        }
    }

    if (!userId) throw new Error("User ID required to create chat");

    const newChat = {
      id: Date.now().toString(),
      userId: userId,
      title: firstMessage ? firstMessage.substring(0, 30) + '...' : 'New Chat',
      createdAt: new Date().toISOString(),
      messages: firstMessage
        ? [{ id: Date.now(), role: 'user', content: firstMessage, timestamp: new Date().toISOString() }]
        : []
    };

    return await db.createChat(newChat);
  },

  getChat: async (chatId) => {
      const session = localStorage.getItem('brand_ai_session');
      if (session) {
          const user = JSON.parse(session);
          const chats = await db.getChats(user.id);
          return chats.find(c => c.id === chatId) || null;
      }
      return null;
  },

  addMessage: async (chatId, role, content) => {
    const chat = await chatStore.getChat(chatId);
    if (!chat) return null;

    const newMessage = {
      id: Date.now(),
      role,
      content,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...(chat.messages || []), newMessage];

    let updatedTitle = chat.title;
    if (updatedMessages.length === 1 && chat.title === 'New Chat') {
       updatedTitle = content.substring(0, 30) + '...';
    }

    const updates = {
        messages: updatedMessages,
        title: updatedTitle
    };

    return await db.updateChat(chatId, updates);
  },

  deleteChat: async (chatId) => {
    return await db.deleteChat(chatId);
  },

  updateChatMessages: async (chatId, messages) => {
      return await db.updateChat(chatId, { messages });
  },

  clearAll: async () => {
    console.warn("clearAll not supported in Supabase mode safely yet.");
  }
};
