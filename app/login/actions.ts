'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const getSupabaseClient = async () => {
  const cookieStore = await cookies()
  
  return createServerClient(
    'https://amkpwrvoothhxxedjshf.supabase.co',
    'sb_publishable_fPCkY4MZS6Yiiq6hQ1UGyQ_3RgHRWqH',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Se ignora en Server Components
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Se ignora en Server Components
          }
        },
      },
    }
  )
}

export async function loginAction(email: string, password: string) {
  try {
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
  } catch (err) {
    return { success: false, error: 'Error interno en el servidor.' }
  }
}

export async function logoutAction() {
  try {
    const supabase = await getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) throw error

    return { success: true }
  } catch (err) {
    console.error('Error al cerrar sesión:', err)
    return { success: false, error: 'No se pudo cerrar la sesión.' }
  }
}