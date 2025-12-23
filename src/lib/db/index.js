import { localAdapter } from './localAdapter';
import { supabaseAdapter } from './supabaseAdapter';

// Configuration: Determine which adapter to use
// Default to LOCAL for now, unless ENV var specifies 'SUPABASE'
// OR if we detect Supabase config in localStorage (dynamic switching)

const getDbMode = () => {
    // If we have credentials stored, prefer Supabase?
    // Or stick to explicit flag.
    // User wants switchable.
    // Let's check a specific 'gaod_db_mode' setting in localStorage first.
    if (typeof window !== 'undefined') {
        const mode = localStorage.getItem('gaod_db_mode');
        if (mode === 'SUPABASE') return 'SUPABASE';
    }
    return import.meta.env.VITE_DB_MODE || 'LOCAL';
}

const DB_MODE = getDbMode();

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
    }
};
