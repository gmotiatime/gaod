import { db } from './db';
import { auth } from './auth';

export const chatStore = {
  getChats: async () => {
    const user = auth.getCurrentUser();
    if (!user) return [];
    return await db.getChats(user.id);
  },

  getChat: async (id) => {
    const user = auth.getCurrentUser();
    if (!user) return null;

    // We can optimize by fetching single if DB supports, but for now reuse getChats filter
    // or assume we want to fetch fresh.
    const chats = await db.getChats(user.id);
    return chats.find(c => c.id === id) || null;
  },

  createChat: async () => {
    const user = auth.getCurrentUser();
    if (!user) throw new Error("User not logged in");

    const newChat = {
      id: crypto.randomUUID(),
      userId: user.id,
      title: 'New Chat',
      messages: [], // Array of { role, content, attachments }
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await db.createChat(newChat);
  },

  addMessage: async (chatId, role, content, attachments = []) => {
    const chat = await chatStore.getChat(chatId);
    if (!chat) throw new Error("Chat not found");

    const newMessage = {
      role,
      content,
      attachments,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...chat.messages, newMessage];

    return await db.updateChat(chatId, { messages: updatedMessages });
  },

  updateTitle: async (chatId, title) => {
      return await db.updateChat(chatId, { title });
  },

  deleteChat: async (chatId) => {
      return await db.deleteChat(chatId);
  },

  // Replaces entire chat content (useful for streaming updates/corrections)
  updateChat: async (chatId, updates) => {
      return await db.updateChat(chatId, updates);
  }
};
