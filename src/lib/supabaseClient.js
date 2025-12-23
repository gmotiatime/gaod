import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hbpowbnojimuolkgquqr.supabase.co';
const supabaseKey = 'sb_publishable_6CEQJtj0yL0ktPYOWjOyRQ_CzJtxbY3';

export const supabase = createClient(supabaseUrl, supabaseKey);
