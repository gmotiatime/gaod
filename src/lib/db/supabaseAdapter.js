import { createClient } from '@supabase/supabase-js';

// Default credentials provided by user
const DEFAULT_URL = 'https://hbpowbnojimuolkgquqr.supabase.co';
const DEFAULT_KEY = 'sb_publishable_6CEQJtj0yL0ktPYOWjOyRQ_CzJtxbY3';

// Helper to get client (lazy load to allow settings update)
const getSupabase = () => {
    const url = localStorage.getItem('brand_ai_supabase_url') || DEFAULT_URL;
    const key = localStorage.getItem('brand_ai_supabase_key') || DEFAULT_KEY;

    if (!url || !key) return null;
    return createClient(url, key);
};

export const supabaseAdapter = {

  // --- SETTINGS ---
  getSetting: async (key) => {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
        // Return null if not found, don't throw
        if (error.code === 'PGRST116') return null;
        console.error('Supabase getSetting error:', error);
        return null;
    }
    return data?.value;
  },

  setSetting: async (key, value) => {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase
      .from('app_settings')
      .upsert({ key, value });

    if (error) {
        console.error('Supabase setSetting error:', error);
        return false;
    }
    return true;
  },

  // --- USERS ---
  getUserByEmail: async (email) => {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
        if (error.code !== 'PGRST116') console.error('Supabase getUserByEmail error:', error);
        return null;
    }

    // Map snake_case to camelCase if needed, but app seems to handle mixed or we should standardize.
    // Auth lib expects: id, email, password, name, role
    return {
        id: data.id,
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        createdAt: data.created_at
    };
  },

  createUser: async (user) => {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { error } = await supabase
      .from('app_users')
      .insert({
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          role: user.role,
          created_at: user.createdAt || new Date().toISOString()
      });

    if (error) {
        console.error('Supabase createUser error:', error);
        return null;
    }
    return user;
  },

  updateUser: async (id, updates) => {
    const supabase = getSupabase();
    if (!supabase) return null;

    // Convert to snake_case for DB
    const dbUpdates = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.password) dbUpdates.password = updates.password;
    if (updates.role) dbUpdates.role = updates.role;

    const { data, error } = await supabase
      .from('app_users')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
        console.error('Supabase updateUser error:', error);
        return null;
    }

    return {
        id: data.id,
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        createdAt: data.created_at
    };
  },

  getAllUsers: async () => {
      const supabase = getSupabase();
      if (!supabase) return [];

      const { data, error } = await supabase.from('app_users').select('*');
      if (error) return [];

      return data.map(u => ({
        id: u.id,
        email: u.email,
        password: u.password,
        name: u.name,
        role: u.role,
        createdAt: u.created_at
      }));
  },

  // --- CHATS ---
  getChats: async (userId) => {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
        console.error('Supabase getChats error:', error);
        return [];
    }

    return data.map(c => ({
        id: c.id,
        userId: c.user_id,
        title: c.title,
        messages: c.messages,
        createdAt: c.created_at,
        updatedAt: c.updated_at
    }));
  },

  createChat: async (chat) => {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { error } = await supabase
      .from('chats')
      .insert({
          id: chat.id,
          user_id: chat.userId,
          title: chat.title,
          messages: chat.messages,
          created_at: chat.createdAt,
          updated_at: chat.updatedAt
      });

    if (error) {
        console.error('Supabase createChat error:', error);
        return null;
    }
    return chat;
  },

  updateChat: async (id, updates) => {
    const supabase = getSupabase();
    if (!supabase) return null;

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
        console.error('Supabase updateChat error:', error);
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
  },

  deleteChat: async (id) => {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', id);

    if (error) {
        console.error('Supabase deleteChat error:', error);
        return false;
    }
    return true;
  }
};
