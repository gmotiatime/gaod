// Simulating a real database interaction
// In a real app, this would be Supabase, Firebase, or a custom API

const STORAGE_KEY = 'brand_ai_users';
const SESSION_KEY = 'brand_ai_session';

// Initialize default admin user if database is empty
const initDatabase = () => {
  const existingUsers = localStorage.getItem(STORAGE_KEY);
  if (!existingUsers) {
    const adminUser = {
      id: 'admin-1',
      email: 'gmotiaaa@gmail.com',
      password: '2099121', // In a real app, this should be hashed
      role: 'admin',
      name: 'Admin User',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([adminUser]));
  }
};

export const auth = {
  login: async (email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    initDatabase();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      const { password, ...userWithoutPassword } = user;
      localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, error: 'Invalid email or password' };
  },

  logout: async () => {
    localStorage.removeItem(SESSION_KEY);
    return { success: true };
  },

  getCurrentUser: () => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  // Helper for admin dashboard to see "real db" data
  getAllUsers: async () => {
    // Check if current user is admin
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
    if (session.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return users.map(({ password, ...u }) => u);
  }
};
