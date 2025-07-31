import { supabase } from './supabase.js'

const ADMIN_USERNAME = 'Administrator'

async function signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, is_admin: username === ADMIN_USERNAME } }
    })
    if (error) throw error
    return data
}

async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
}

async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
}

export { signUp, signIn, signOut, getCurrentUser, ADMIN_USERNAME }