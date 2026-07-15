'use client'
import { useEffect, useState } from 'react'
import { Calendar, Users, ClipboardList, LogOut, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase' // Ajusta esta ruta según tu proyecto
import { motion } from 'framer-motion'

interface SidebarLayoutProps {
  children: React.ReactNode
  activeTab: 'calendario' | 'colaboradores' | 'registro'
}

export default function SidebarLayout({ children, activeTab }: SidebarLayoutProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // 1. Evitar errores de hidratación en Vercel cargando el tema solo en el cliente
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // 2. Alternar entre modo claro y oscuro
  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setDarkMode(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setDarkMode(true)
    }
  }

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* BARRA LATERAL (SIDEBAR) CON ANIMACIÓN DE ANCHO */}
      <motion.aside 
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between p-4 shrink-0 relative"
      >
        {/* BOTÓN FLOTANTE PARA COLAPSAR/EXPANDIR (Fiel a tu imagen original) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full p-1 shadow-sm z-50 text-slate-400 dark:text-slate-500 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        
        {/* PARTE SUPERIOR: LOGO Y NAVEGACIÓN */}
        <div className="space-y-6">
          
          {/* LOGOTIPO ORIGINAL: LETS TRIP */}
          <div className="px-2 py-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-extrabold text-sm tracking-tight shadow-sm shrink-0">
              LT
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-black tracking-wider text-slate-800 dark:text-slate-100 uppercase"
              >
                LETS TRIP
              </motion.span>
            )}
          </div>

          {/* MENÚ DE NAVEGACIÓN */}
          <nav className="space-y-1">
            <Link 
              href="/calendario" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'calendario' 
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Calendar size={16} className="shrink-0" />
              {!isCollapsed && <span>Calendario</span>}
            </Link>

            <Link 
              href="/colaboradores" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'colaboradores' 
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Users size={16} className="shrink-0" />
              {!isCollapsed && <span>Colaboradores</span>}
            </Link>

            <Link 
              href="/registro" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'registro' 
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <ClipboardList size={16} className="shrink-0" />
              {!isCollapsed && <span>Registro</span>}
            </Link>
          </nav>
        </div>

        {/* PARTE INFERIOR: MODO OSCURO Y CERRAR SESIÓN */}
        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          
          {/* BOTÓN MODO CLARO / OSCURO (Corregido para producción y adaptado a tu barra) */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200/40 dark:border-slate-800/40 transition-all ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            {!mounted ? (
              <>
                <Sun size={16} className="text-slate-400 shrink-0" />
                {!isCollapsed && <span>Cargando Tema</span>}
              </>
            ) : darkMode ? (
              <>
                <Sun size={16} className="text-amber-500 shrink-0" />
                {!isCollapsed && <span>Modo Claro</span>}
              </>
            ) : (
              <>
                <Moon size={16} className="text-indigo-400 shrink-0" />
                {!isCollapsed && <span>Modo Oscuro</span>}
              </>
            )}
          </button>

          {/* BOTÓN CERRAR SESIÓN */}
          <button
            onClick={handleCerrarSesion}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={16} className="shrink-0" />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </motion.aside>

      {/* CONTENIDO PRINCIPAL DE LA APP */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}