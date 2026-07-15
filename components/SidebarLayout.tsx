'use client'
import { useEffect, useState } from 'react'
import { Calendar, Users, ClipboardList, LogOut, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase' // Asegúrate de que esta ruta sea la correcta en tu proyecto

interface SidebarLayoutProps {
  children: React.ReactNode
  activeTab: 'calendario' | 'colaboradores' | 'registro'
}

export default function SidebarLayout({ children, activeTab }: SidebarLayoutProps) {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState<boolean | null>(null) // Evita parpadeos de hidratación en Next.js

  // 1. Cargar el tema inicial respetando localStorage o el sistema
  useEffect(() => {
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
    router.push('/login') // Cambia a tu ruta de login si es diferente
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between p-4 shrink-0">
        
        {/* Parte superior: Navegación */}
        <div className="space-y-6">
          <div className="px-2 py-1">
            <span className="text-lg font-black tracking-wider bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              MI APP
            </span>
          </div>

          <nav className="space-y-1">
            <Link 
              href="/calendario" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'calendario' 
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Calendar size={16} />
              Calendario
            </Link>

            <Link 
              href="/colaboradores" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'colaboradores' 
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Users size={16} />
              Colaboradores
            </Link>

            <Link 
              href="/registro" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'registro' 
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <ClipboardList size={16} />
              Registro
            </Link>
          </nav>
        </div>

        {/* Parte inferior: Botones de Configuración y Cierre */}
        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          
          {/* BOTÓN MODO CLARO / OSCURO (Evita renderizarse vacío durante la hidratación) */}
          {darkMode !== null && (
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200/40 dark:border-slate-800/40 transition-all"
            >
              {darkMode ? (
                <>
                  <Sun size={16} className="text-amber-500" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon size={16} className="text-indigo-400" />
                  <span>Modo Oscuro</span>
                </>
              )}
            </button>
          )}

          {/* Botón Cerrar Sesión */}
          <button
            onClick={handleCerrarSesion}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}