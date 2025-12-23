import { createClient } from '@supabase/supabase-js';

const url = 'https://hbpowbnojimuolkgquqr.supabase.co';
const key = 'sb_publishable_6CEQJtj0yL0ktPYOWjOyRQ_CzJtxbY3';

const supabase = createClient(url, key);

async function test() {
  try {
    const { data, error } = await supabase.from('app_users').select('*').limit(1);
    if (error) {
      console.log('Error:', error.message);
    } else {
      console.log('Connection successful. Data:', data);
    }
  } catch (err) {
    console.log('Exception:', err.message);
  }
}

test();
