'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/login/actions' // <-- RUTA CORREGIDA Y BLINDADA
import { 
  Calendar, 
  Users, 
  Clipboard, 
  Sun, 
  Moon, 
  LogOut
} from 'lucide-react'

interface SidebarLayoutProps {
  children: React.ReactNode
  activeTab: string
}

export default function SidebarLayout({ children, activeTab }: SidebarLayoutProps) {
  const pathname = usePathname()
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Sincronizar el tema original (Light/Dark mode)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Alternar entre modo claro y oscuro
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDarkMode(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDarkMode(true)
    }
  }

  // CERRAMOS SESIÓN COMPLETAMENTE
  const handleSignOut = async () => {
    try {
      // 1. Intentamos cerrar sesión en el servidor para limpiar cookies de Supabase
      await logoutAction()
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error)
    } finally {
      try {
        // 2. RESPALDO SEGURO: Borramos cookies accesibles por cliente sin crasear el bucle
        const cookies = document.cookie.split(";")
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i]
          const eqPos = cookie.indexOf("=")
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
          if (name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`
          }
        }
      } catch (cookieError) {
        console.error('Error limpiando cookies locales:', cookieError)
      }

      // 3. Limpiamos cualquier rastro en sessionStorage/localStorage
      sessionStorage.clear()

      // 4. Redirección dura, limpia e instantánea al login (¡Fuera de peligro!)
      window.location.href = '/login'
    }
  }

  // Tus 3 rutas reales exactas
  const navItems = [
    { id: 'calendario', label: 'Calendario', href: '/calendario', icon: Calendar },
    { id: 'colaboradores', label: 'Colaboradores', href: '/colaboradores', icon: Users },
    { id: 'registro', label: 'Registro', href: '/registro', icon: Clipboard },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Barra lateral clásica */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 p-4 flex flex-col justify-between fixed top-0 bottom-0 left-0 z-30 transition-colors shadow-sm">
        
        {/* Parte Superior (Logo LETS TRIP y menú) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-1.5 min-h-[44px]">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
              LT
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap">
              LETS TRIP
            </span>
          </div>

          {/* Menú de Navegación con tus opciones reales */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <Link 
                  key={item.id} 
                  href={item.href}
                  className={`flex items-center rounded-xl transition-all h-11 px-3.5 gap-3 ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="text-xs font-bold whitespace-nowrap">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Parte Inferior (Controles rápidos) */}
        <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          
          {/* Botón de Modo Claro / Oscuro */}
          <button 
            onClick={toggleDarkMode}
            type="button"
            className="flex items-center rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 transition-all h-11 px-3.5 gap-3 w-full cursor-pointer"
          >
            {isDarkMode ? (
              <Sun size={18} className="text-amber-400 shrink-0" />
            ) : (
              <Moon size={18} className="shrink-0" />
            )}
            <span className="text-xs font-bold whitespace-nowrap">
              {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
            </span>
          </button>

          {/* Botón Cerrar Sesión */}
          <button 
            onClick={handleSignOut}
            type="button"
            className="flex items-center rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all h-11 px-3.5 gap-3 w-full cursor-pointer"
          >
            <LogOut size={18} className="shrink-0" />
            <span className="text-xs font-bold whitespace-nowrap">Cerrar Sesión</span>
          </button>
          
        </div>
      </aside>

      {/* Contenedor del contenido principal */}
      <main className="flex-1 min-h-screen pl-64 p-6 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>

    </div>
  )
}