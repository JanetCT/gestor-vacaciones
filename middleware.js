import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    'https://amkpwrvoothhxxedjshf.supabase.co',
    'sb_publishable_fPCkY4MZS6Yiiq6hQ1UGyQ_3RgHRWqH',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Validar si el usuario tiene sesión activa
  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()

  // Rutas de tu aplicación que requieren estar logueado
  const rutasProtegidas = ['/calendario', '/colaboradores', '/registro']
  const esRutaProtegida = rutasProtegidas.some((ruta) => url.pathname.startsWith(ruta))

  // CASO 1: Si no hay usuario y está en una ruta protegida -> Mandar al LOGIN directo
  if (!user && esRutaProtegida) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // CASO 2: Si entran a la raíz (/) directamente sin ruta
  if (url.pathname === '/') {
    if (user) {
      url.pathname = '/calendario' // Si está logueado, va al calendario
    } else {
      url.pathname = '/login'      // Si no, va al login directo
    }
    return NextResponse.redirect(url)
  }

  // CASO 3: Si ya está logueado e intenta ir al login -> Mandar al calendario
  if (user && url.pathname.startsWith('/login')) {
    url.pathname = '/calendario'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto archivos estáticos, imágenes, favicon, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}