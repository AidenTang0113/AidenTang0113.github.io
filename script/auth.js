import { supabase } from './supabase.js'

const ADMIN_USERNAMES = ['Administrator', 'SuperAdmin']

export async function signUp(email, password, username) {
    // First create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username }
        }
    })
    if (authError) throw authError

    // Then create profile
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: authData.user.id,
            username,
            email,
            is_admin: ADMIN_USERNAMES.includes(username)
        })
    
    if (profileError) throw profileError
    return authData
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
}

export async function getCurrentUser() {
    // Verify active session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) throw new Error('Not authenticated')

    // Then get user details
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    // Finally get profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profileError) throw profileError
    return { user, profile, session }
}

export async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}