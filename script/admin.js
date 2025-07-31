import { supabase } from './supabase.js'

export async function getAllUsers() {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`is_admin.eq.true,id.eq.${user.id}`) // Only admins can see all users
    
    if (error) throw error
    return data
}

export async function updateUserAdminStatus(userId, isAdmin) {
    // Verify current user is admin first
    const { data: { user } } = await supabase.auth.getUser()
    const { data: adminCheck } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
    
    if (!adminCheck?.is_admin) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('profiles')
        .update({ is_admin: isAdmin })
        .eq('id', userId)

    if (error) throw error
}

export async function deleteUser(userId) {
    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    const { data: adminCheck } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
    
    if (!adminCheck?.is_admin) throw new Error('Unauthorized')

    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) throw error
}