// Test script to verify backend functionality
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vswsuekzuogehafqpxuh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd3N1ZWt6dW9nZWhhZnFweHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzAyNzgsImV4cCI6MjA3MTA0NjI3OH0.1lzHfF_Xex3l7Zn3hsFSgMIwrJZTSeDOUOlsx1oLxZ0';

async function testConnection() {
    console.log('🔍 Testing Supabase connection...');

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Test connection
        const { data, error } = await supabase
            .from('users')
            .select('count', { count: 'exact' });

        if (error) {
            console.error('❌ Connection failed:', error.message);
            return false;
        }

        console.log('✅ Connection successful!');
        console.log(`📊 Users table exists with ${data.length} records`);
        return true;

    } catch (err) {
        console.error('❌ Test failed:', err.message);
        return false;
    }
}

testConnection();
