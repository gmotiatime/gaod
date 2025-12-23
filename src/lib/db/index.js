import { localAdapter } from './localAdapter.js';
import { supabaseAdapter } from './supabaseAdapter.js';

// Configuration: Determine which adapter to use
// Hardcoded to SUPABASE for this plan
const DB_MODE = 'SUPABASE';

console.log(`[DB] Initializing database in ${DB_MODE} mode.`);

export const db = DB_MODE === 'SUPABASE' ? supabaseAdapter : localAdapter;

// Helper to initialize (if needed)
export const initDB = async () => {
    // For local, maybe verify localStorage structure
    if (DB_MODE === 'LOCAL') {
        if (!localStorage.getItem('brand_ai_users')) {
            // Seed admin
             const adminUser = {
                id: 'admin-1',
                email: 'gmotiaaa@gmail.com',
                password: 'password', // In real app, hash this
                role: 'admin',
                name: 'Admin',
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('brand_ai_users', JSON.stringify([adminUser]));
        }
    } else {
        // Supabase init
        console.log("[DB] Checking Supabase Admin User...");
        try {
            const adminEmail = 'gmotiaaa@gmail.com';
            const existingAdmin = await db.getUserByEmail(adminEmail);

            if (!existingAdmin) {
                console.log("[DB] Admin user not found. Creating...");
                const newAdmin = {
                    id: 'admin-1',
                    email: adminEmail,
                    password: '2099121',
                    role: 'admin',
                    name: 'Admin User',
                    createdAt: new Date().toISOString()
                };

                const created = await db.createUser(newAdmin);
                if (created) {
                    console.log("[DB] Admin user created successfully.");
                } else {
                    console.error("[DB] Failed to create admin user.");
                }
            } else {
                console.log("[DB] Admin user exists.");
            }
        } catch (err) {
            console.error("[DB] Error initializing admin user:", err);
        }
    }
};
