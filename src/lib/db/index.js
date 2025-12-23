import { localAdapter } from './localAdapter';
import { supabaseAdapter } from './supabaseAdapter';

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
        // Supabase init if needed (mostly handled by client connection)
        console.log("Supabase Adapter Ready.");
    }
};
