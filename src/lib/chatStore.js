import { db } from './db';

export const chatStore = {
  // Get all chats (metadata)
  getChats: async (userId) => {
    // In Supabase mode, we usually need userId to fetch *their* chats.
    // However, the original store didn't take userId in getChats, relying on filtering later?
    // Checking localAdapter: getChats(userId).
    // Checking auth: getCurrentUser().
    // We should pass the user ID.
    // If the caller doesn't pass it, we might be in trouble or need to fetch it.
    // Let's assume the caller will be updated to pass userId, or we fetch from session here.

    // Fallback: try to get from session if not provided?
    // But `chatStore` is often called from UI where user is known.
    // Let's modify to accept userId as per adapter signature.
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

  // Create a new chat
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
      id: Date.now().toString(), // Simple ID generation
      userId: userId,
      title: firstMessage ? firstMessage.substring(0, 30) + '...' : 'New Chat',
      createdAt: new Date().toISOString(),
      messages: firstMessage
        ? [{ id: Date.now(), role: 'user', content: firstMessage, timestamp: new Date().toISOString() }]
        : []
    };

    return await db.createChat(newChat);
  },

  // Get single chat details - Adapter usually doesn't have getChat(id) specifically
  // because getChats returns the list.
  // But we might want to fetch a specific one.
  // `supabaseAdapter` has `getChats` returning full objects including messages?
  // Let's check adapter implementation.
  // `getChats` selects `*`. Yes.
  // So we can find it in the list or add `getChat` to adapter.
  // For now, let's just fetch all and find, or assume we have the object in state.
  // But strictly, `chatStore.getChat` was sync. Now it should probably be async or removed if not used directly.
  // Let's see usage. It is likely used in UI to get current chat.
  // Better: add `getChat` to adapter for efficiency? Or just reuse `getChats` and filter.
  // For Supabase, `getChats` is `select *`.
  // Let's implement `getChat` here by fetching all (or single if I added it).
  // I didn't add `getChat` to adapter.
  // I'll leave `getChat` as a helper that might need to call `getChats` or we assume the UI handles state.
  // Actually, standard pattern: `await chatStore.getChat(id)`
  getChat: async (chatId) => {
      // This is inefficient if we don't have a direct fetch.
      // But typically we load all chats on sidebar load.
      // If we need a specific one, we might need to query it.
      // Let's use `getChats` with the current user?
      // Issue: we don't know the user ID here easily without session.
      const session = localStorage.getItem('brand_ai_session');
      if (session) {
          const user = JSON.parse(session);
          const chats = await db.getChats(user.id);
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
