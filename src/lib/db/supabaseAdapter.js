import { supabase } from '../supabaseClient';

export const supabaseAdapter = {
  // --- SETTINGS ---
  getSetting: async (key) => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error fetching setting:', error);
      }
      return data?.value || null;
    } catch (err) {
      console.error('Exception fetching setting:', err);
      return null;
    }
  },

  setSetting: async (key, value) => {
    try {
      // Upsert: insert if not exists, update if exists
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) {
          console.error('Error saving setting:', error);
          return false;
      }
      return true;
    } catch (err) {
      console.error('Exception saving setting:', err);
      return false;
    }
  },

  // --- USERS ---
  getUserByEmail: async (email) => {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
          if (error.code !== 'PGRST116') console.error('Error fetching user:', error);
          return null;
      }
      return data;
    } catch (err) {
      console.error('Exception fetching user:', err);
      return null;
    }
  },

  createUser: async (user) => {
    try {
      // user object should match table columns: id, email, password, name, role, created_at
      const { data, error } = await supabase
        .from('app_users')
        .insert([{
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            role: user.role,
            created_at: user.createdAt // Ensure casing matches if needed, but schema says created_at
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Exception creating user:', err);
      return null;
    }
  },

  updateUser: async (id, updates) => {
      // Not strictly needed for the plan but good to have
      try {
          const { data, error } = await supabase
            .from('app_users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if(error) {
              console.error('Error updating user', error);
              return null;
          }
          return data;
      } catch (err) {
          return null;
      }
  },

  // --- CHATS ---
  getChats: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
        return [];
      }

      // Map back to frontend expected structure if needed
      // Frontend expects: id, title, messages (json), createdAt, updatedAt
      // DB columns: id, user_id, title, messages (jsonb), created_at, updated_at
      return data.map(chat => ({
          id: chat.id,
          userId: chat.user_id,
          title: chat.title,
          messages: chat.messages || [],
          createdAt: chat.created_at,
          updatedAt: chat.updated_at
      }));
    } catch (err) {
      console.error('Exception fetching chats:', err);
      return [];
    }
  },

  createChat: async (chat) => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .insert([{
            id: chat.id,
            user_id: chat.userId, // Note: DB column is user_id
            title: chat.title,
            messages: chat.messages,
            created_at: chat.createdAt,
            updated_at: chat.createdAt
        }])
        .select()
        .single();

      if (error) {
          console.error('Error creating chat:', error);
          return null;
      }
      return {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          messages: data.messages,
          createdAt: data.created_at,
          updatedAt: data.updated_at
      };
    } catch (err) {
      console.error('Exception creating chat:', err);
      return null;
    }
  },

  updateChat: async (id, updates) => {
    try {
      // Map frontend keys to DB keys if necessary
      const dbUpdates = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.messages) dbUpdates.messages = updates.messages;
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('chats')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
          console.error('Error updating chat:', error);
          return null;
      }
      return {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          messages: data.messages,
          createdAt: data.created_at,
          updatedAt: data.updated_at
      };
    } catch (err) {
      console.error('Exception updating chat:', err);
      return null;
    }
  },

  deleteChat: async (id) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', id);

      if (error) {
          console.error('Error deleting chat:', error);
          return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  },

  getAllUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('id, name, email, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all users:', error);
        return [];
      }
      // Return plain objects, ensure camelCase if needed by frontend,
      // but current table matches DB columns mostly.
      // Frontend expects: id, name, email, role, createdAt
      return data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.created_at
      }));
    } catch (err) {
      console.error('Exception fetching all users:', err);
      return [];
    }
  }
};
