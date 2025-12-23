import { db } from './db';

// Helper to get userId if not provided
const getUserId = (providedId) => {
  if (providedId) return providedId;
  const session = localStorage.getItem('brand_ai_session');
  if (session) {
      try {
          const user = JSON.parse(session);
          return user.id;
      } catch (e) {
          console.error("Failed to parse session", e);
          return null;
      }
  }
  return null;
};

export const chatStore = {
  // Get all chats (metadata)
  getChats: async (userId) => {
    const id = getUserId(userId);
    if (!id) return [];
    return await db.getChats(id);
  },

  // Create a new chat
  createChat: async (firstMessage = null, userId) => {
    const id = getUserId(userId);
    if (!id) throw new Error("User ID required to create chat");

    const newChat = {
      id: Date.now().toString(), // Simple ID generation
      userId: id,
      title: firstMessage ? firstMessage.substring(0, 30) + '...' : 'New Chat',
      createdAt: new Date().toISOString(),
      messages: firstMessage
        ? [{ id: Date.now(), role: 'user', content: firstMessage, timestamp: new Date().toISOString() }]
        : []
    };

    return await db.createChat(newChat);
  },

  getChat: async (chatId) => {
      const userId = getUserId();
      if (userId) {
          const chats = await db.getChats(userId);
          return chats.find(c => c.id === chatId) || null;
      }
      return null;
  },

  // Add message to chat
  addMessage: async (chatId, role, content) => {
    // We need to fetch the current chat, append message, and update.
    // This requires a read-modify-write cycle or a smarter DB update.
    // Since `messages` is a JSONB column, we can do this.

    // 1. Get current chat
    const chat = await chatStore.getChat(chatId);
    if (!chat) return null;

    const newMessage = {
      id: Date.now(),
      role,
      content,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...(chat.messages || []), newMessage];

    // Update title if needed
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

  // Delete chat
  deleteChat: async (chatId) => {
    return await db.deleteChat(chatId);
  },

  // Clear all - Not implemented in adapter/supabase for "all" (safety),
  // maybe just ignore or loop delete?
  // The original had `clearAll` for local storage clearing.
  // We can probably skip or implement if needed.
  // Let's skip for now as it's dangerous on a real DB.
  clearAll: async () => {
    console.warn("clearAll not supported in Supabase mode safely yet.");
  }
};
