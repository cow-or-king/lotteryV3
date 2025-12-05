const { createClient } = require('@supabase/supabase-js');

// Test de connexion Supabase
const supabaseUrl = 'https://ynrdyircogzytfgueyva.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlucmR5aXJjb2d6eXRmZ3VleXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NzE4MjMsImV4cCI6MjA4MDU0NzgyM30.TCw0TLKsc0NlDl7yTR6zZzeB5JlodifBpO_yxOAuCLs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');

  try {
    // Test simple query
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error && error.message.includes('relation "public.users" does not exist')) {
      console.log('✅ Connection successful! (Table does not exist yet, which is normal)');
    } else if (error) {
      console.error('❌ Connection failed:', error);
    } else {
      console.log('✅ Connection successful!');
    }
  } catch (err) {
    console.error('❌ Connection error:', err);
  }
}

testConnection();
