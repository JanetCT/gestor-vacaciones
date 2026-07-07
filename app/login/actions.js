'use server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Función auxiliar para obtener el almacén de cookies de forma segura
async function getCookieStore() {
  const store = cookies();
  // Si la versión de Next.js maneja las cookies como Promesa, la resolvemos; si no, devuelve el objeto directo
  return store instanceof Promise ? await store : store;
}

/**
 * Acción de Servidor para iniciar sesión con Correo y Contraseña
 */
export async function loginAction(email, password) {
  try {
    const cookieStore = await getCookieStore()

    const supabase = createServerClient(
      'https://amkpwrvoothhxxedjshf.supabase.co',
      'sb_publishable_fPCkY4MZS6Yiiq6hQ1UGyQ_3RgHRWqH',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Permitir llamadas seguras desde componentes de servidor
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("Error crítico en loginAction:", err)
    return { success: false, error: "Error interno del servidor al procesar la sesión." }
  }
}

/**
 * Acción de Servidor para cerrar sesión limpiando cookies por completo
 */
export async function logoutAction() {
  try {
    const cookieStore = await getCookieStore()

    const supabase = createServerClient(
      'https://amkpwrvoothhxxedjshf.supabase.co',
      'sb_publishable_fPCkY4MZS6Yiiq6hQ1UGyQ_3RgHRWqH',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Permitir llamadas seguras desde componentes de servidor
            }
          },
        },
      }
    )

    // 1. Cierra la sesión en Supabase
    await supabase.auth.signOut()

    // 2. Limpieza manual garantizada de las cookies de sesión
    const cookiesActuales = cookieStore.getAll()
    cookiesActuales.forEach(cookie => {
      if (cookie.name.includes('auth-token') || cookie.name.includes('sb-')) {
        cookieStore.set(cookie.name, '', { maxAge: 0, path: '/' })
      }
    })

    return { success: true }
  } catch (err) {
    console.error("Error crítico en logoutAction:", err)
    return { success: false, error: "Error interno del servidor al cerrar sesión." }
  }
}