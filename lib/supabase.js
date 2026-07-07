import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://amkpwrvoothhxxedjshf.supabase.co'
// Usamos tu clave pública que definiste en el proyecto
const supabaseAnonKey = 'sb_publishable_fPCkY4MZS6Yiiq6hQ1UGyQ_3RgHRWqH'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // Guarda la sesión automáticamente
    autoRefreshToken: true,    // Mantiene el token activo
    detectSessionInUrl: true,  // Detecta flujos de autenticación si los hay
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})