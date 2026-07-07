import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // 1. Filtro rápido: dejar pasar assets estáticos e internos de Next.js sin colgar la red
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // 2. Respuesta base limpia
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 3. Inicialización segura del cliente del servidor
  const supabase = createServerClient(
    'https://amkpwrvoothhxxedjshf.supabase.co',
    'sb_publishable_fPCkY4MZS6Yiiq6hQ1UGyQ_3RgHRWqH',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          try {
            // Actualiza las cookies en la petición entrante
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            
            // Re-instancia la respuesta limpia con las nuevas cabeceras
            response = NextResponse.next({
              request,
            })
            
            // Asigna las cookies salientes para el navegador
            cookiesToSet.forEach(({ name, value, options }) => 
              response.cookies.set(name, value, options)
            )
          } catch (error) {
            // Mitiga mutaciones concurrentes en redirecciones directas
          }
        },
      },
    }
  )

  // 4. Verificación de identidad (refresca tokens de forma segura de ser necesario)
  const { data: { user } } = await supabase.auth.getUser()
  const isLoginPage = pathname.startsWith('/login')

  // Redirecciones lógicas estables
  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}