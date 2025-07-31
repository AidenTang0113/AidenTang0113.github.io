import { supabase } from './supabase.js'

async function signUp(email, password) {
  const { user, error } = await supabase.auth.signUp({
    email,
    password
  })
  
  if (error) throw error
  return user
}


async function signIn(email, password) {
  const { user, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return user
}

async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export { signUp, signIn, signOut, getSession }