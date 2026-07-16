'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/login/actions'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  Clipboard, 
  Sun, 
  Moon, 
  LogOut,
  ChevronLeft
} from 'lucide-react'

interface SidebarLayoutProps {
  children: React.ReactNode
  activeTab: string
}

export default function SidebarLayout({ children, activeTab }: SidebarLayoutProps) {
  const pathname = usePathname()
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Estado para controlar si el menú está colapsado o expandido
  const [isCollapsed, setIsCollapsed] = useState(false)

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

  // Cierre de sesión seguro
  const handleSignOut = async () => {
    try {
      await logoutAction()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      try {
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
      sessionStorage.clear()
      window.location.href = '/login'
    }
  }

  const navItems = [
    { id: 'calendario', label: 'Calendario', href: '/calendario', icon: Calendar },
    { id: 'colaboradores', label: 'Colaboradores', href: '/colaboradores', icon: Users },
    { id: 'registro', label: 'Registro', href: '/registro', icon: Clipboard },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* BARRA LATERAL ANIMADA */}
      <motion.aside 
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-r border-slate-200/60 dark:border-slate-800/60 p-4 flex flex-col justify-between fixed top-0 bottom-0 left-0 z-30 shadow-[1px_0_10px_rgba(0,0,0,0.02)] select-none overflow-hidden"
      >
        {/* PARTE SUPERIOR (Logo, Botón Colapsar y Menú) */}
        <div className="space-y-7">
          
          {/* Header con Logo y Botón de Flecha */}
          <div className="flex items-center justify-between min-h-[44px] px-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20 shrink-0">
                LT
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col"
                  >
                    <span className="font-black text-xs tracking-widest text-slate-900 dark:text-slate-50">
                      LETS TRIP
                    </span>
                    <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">
                      
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Botón para expandir/colapsar */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronLeft size={18} />
              </motion.div>
            </button>
          </div>

          {/* Menú de Navegación */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <Link 
                  key={item.id} 
                  href={item.href}
                  className="relative flex items-center h-11 px-3.5 gap-3 rounded-xl group overflow-hidden cursor-pointer"
                >
                  {/* Animación fluida de fondo activo */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-indigo-600 dark:bg-indigo-600/90 rounded-xl z-0 shadow-md shadow-indigo-600/20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Icono */}
                  <Icon 
                    size={18} 
                    className={`relative z-10 shrink-0 transition-colors duration-200 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                    }`} 
                  />
                  
                  {/* Etiqueta de texto animada */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.15 }}
                        className={`relative z-10 text-xs font-bold tracking-wide whitespace-nowrap transition-colors duration-200 ${
                          isActive 
                            ? 'text-white' 
                            : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                        }`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* PARTE INFERIOR (Ajustes Rápidos y Cerrar Sesión) */}
        <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          
          {/* Cambiar Tema */}
          <button 
            onClick={toggleDarkMode}
            type="button"
            className="flex items-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 transition-all h-11 px-3.5 gap-3 w-full cursor-pointer group"
          >
            <div className="shrink-0 transition-transform duration-300 group-hover:rotate-12">
              {isDarkMode ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} />
              )}
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-bold whitespace-nowrap"
                >
                  {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Cerrar Sesión */}
          <button 
            onClick={handleSignOut}
            type="button"
            className="flex items-center rounded-xl text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all h-11 px-3.5 gap-3 w-full cursor-pointer group"
          >
            <LogOut size={18} className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-bold whitespace-nowrap"
                >
                  Cerrar Sesión
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
        </div>
      </motion.aside>

      {/* CONTENEDOR DEL CONTENIDO PRINCIPAL */}
      <motion.main 
        animate={{ paddingLeft: isCollapsed ? 80 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-1 min-h-screen p-6 transition-all duration-300"
      >
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </motion.main>

    </div>
  )
}