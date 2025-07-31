import { supabase } from './supabase.js'

const ADMIN_USERNAMES = ['Administrator', 'SuperAdmin']

async function signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
                is_admin: ADMIN_USERNAMES.includes(username)
            }
        }
    })
    if (error) throw error
    
    await supabase.from('profiles').upsert({
        id: data.user.id,
        username,
        email,
        is_admin: ADMIN_USERNAMES.includes(username)
    })
    
    return data
}

async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
}

async function getSession() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        
    if (profileError) throw profileError
    
    return { ...user, profile }
}

export { signUp, signIn, getSession }