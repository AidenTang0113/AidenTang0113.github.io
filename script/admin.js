import { supabase } from './supabase.js'

async function getAllUsers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
    if (error) throw error
    return data
}

async function updateUserAdminStatus(userId, isAdmin) {
    const { error } = await supabase
        .from('profiles')
        .update({ is_admin: isAdmin })
        .eq('id', userId)
    if (error) throw error
}

export { getAllUsers, updateUserAdminStatus }