// Initialize Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
const supabaseUrl = 'https://ljpabdslccothxzyqlmv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqcGFiZHNsY2NvdGh4enlxbG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDIxNTEsImV4cCI6MjA2OTUxODE1MX0.TxEOCkpgQG4ri-oHy3CARqKIrxD-o1xZ0fF5PLlfMdg';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Helper function to login with username or email
async function loginWithUsernameOrEmail(identifier, password) {
    // First try to find user by email
    let { data: userByEmail, error: emailError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', identifier)
        .single();
    
    if (userByEmail) {
        // If found by email, login with email
        const { error } = await supabase.auth.signInWithPassword({
            email: identifier,
            password
        });
        return { error };
    }
    
    // If not found by email, try by username
    let { data: userByUsername, error: usernameError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .single();
    
    if (userByUsername) {
        // If found by username, login with email (since Supabase auth uses email)
        const { error } = await supabase.auth.signInWithPassword({
            email: userByUsername.email,
            password
        });
        return { error };
    }
    
    // If neither found
    return { error: { message: 'No user found with this username or email' } };
}