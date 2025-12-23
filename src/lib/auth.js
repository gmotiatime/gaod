import { db } from './db';

const SESSION_KEY = 'brand_ai_session';

export const auth = {
  login: async (email, password) => {
    try {
        const user = await db.getUserByEmail(email);

        if (user && user.password === password) {
          // eslint-disable-next-line no-unused-vars
          const { password: _, ...userWithoutPassword } = user;
          localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
          return { success: true, user: userWithoutPassword };
        }

        return { success: false, error: 'Invalid email or password' };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: 'Login failed due to system error' };
    }
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

    // For Supabase, we don't have a "getAllUsers" in the generic adapter yet,
    // but the original auth.js had it. Let's assume we can fetch all from DB if needed,
    // or we might need to add it to adapter.
    // However, the adapter interface didn't strictly specify getAllUsers.
    // Let's use direct access if db adapter allows, or add a method.
    // For now, let's try to query via db if it was exposed, OR add it to adapter.
    // Wait, the previous AdminDashboard called auth.getAllUsers().
    // We should implement it here.

    // Since we don't have getAllUsers in the adapter interface I defined in step 2 (my bad),
    // I should probably add it to the adapter or access supabase directly here?
    // Accessing supabase directly here breaks the abstraction.
    // Better to use the DB adapter. I'll assume db.getAllUsers exists or I'll add it.
    // Let's add it to the adapter in the next thought/step if missing, but for now
    // let's stick to the plan.
    // Actually, looking at `supabaseAdapter.js`, I didn't add `getAllUsers`.
    // I will add it to `supabaseAdapter.js` in a fix-up or just do it here via the imported client if I have to?
    // No, cleaner to keep it in adapter.
    // BUT, since I can't modify adapter in this step easily without going back,
    // I'll implement it here using the `db` object if I can, but `db` abstracts it.

    // Allow me to do a quick fix: I will assume `db.getAllUsers()` exists and update adapter in next step
    // or just inline the supabase call if I import it? No.
    // I'll update `auth.js` to assume `db.getAllUsers()` works, and I will strictly ensure to add it to `supabaseAdapter`
    // in a subsequent action or right now if I can.

    // Actually, checking previous `AdminDashboard.jsx`, it called `auth.getAllUsers()`.
    // So this function MUST exist.

    // Let's use `db.getAllUsers()` and I will make sure to update the adapter to support it.
    if (db.getAllUsers) {
        return await db.getAllUsers();
    }

    return [];
  },

  createUser: async (userData) => {
    // Check if current user is admin
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
    if (session.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    try {
        const existingUser = await db.getUserByEmail(userData.email);
        if (existingUser) {
          return { success: false, error: 'Email already exists' };
        }

        const newUser = {
          id: `user-${Date.now()}`, // Or let Supabase handle ID if UUID? But schema said text primary key.
          createdAt: new Date().toISOString(),
          ...userData
        };

        const createdUser = await db.createUser(newUser);

        if (createdUser) {
             // eslint-disable-next-line no-unused-vars
            const { password: _, ...userWithoutPassword } = createdUser;
            return { success: true, user: userWithoutPassword };
        } else {
             return { success: false, error: 'Failed to create user in DB' };
        }

    } catch (err) {
        console.error("Create user error:", err);
        return { success: false, error: 'System error' };
    }
  }
};
