import { supabase } from './supabase.js'

export async function getAllUsers() {
    const { data, error } = await supabase.from('users').select('*')
    if (error) throw error
    return data
}

export async function deleteUser(userId) {
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) throw error
}

export async function updateUserRole(userId, isAdmin) {
    const { error } = await supabase.from('users')
        .update({ is_admin: isAdmin })
        .eq('id', userId)
    if (error) throw error
}