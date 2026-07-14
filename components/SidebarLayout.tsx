'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Users, List, LogOut, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { logoutAction } from '@/app/login/actions'

interface SidebarLayoutProps {
  children: React.ReactNode
  activeTab: 'calendario' | 'colaboradores' | 'registro'
}

export default function SidebarLayout({ children, activeTab }: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const savedState = localStorage.getItem('sidebar_collapsed')
    if (savedState) setIsCollapsed(savedState === 'true')

    const temaGuardado = localStorage.getItem('theme')
    if (temaGuardado === 'dark') {
      document.documentElement.classList.add('dark')
      setDarkMode(true)
    } else {
      document.documentElement.classList.remove('dark')
      setDarkMode(false)
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar_collapsed', String(newState))
  }

  const toggleDarkMode = () => {
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

  const handleLogout = async () => {
    await logoutAction()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    // 🎛️ Aquí unificamos fondos con el body y añadimos una transición suave
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased relative transition-colors duration-200">
      
      {/* 🧭 MENÚ LATERAL */}
      <aside className={`bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between p-4 shrink-0 relative transition-all duration-200 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        
        {/* 🔘 BOTÓN FLOTANTE PARA EXPANDIR/OCULTAR */}
        <button 
          onClick={toggleSidebar} 
          className="absolute -right-3 top-7 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 shadow-sm z-10 transition-transform duration-150 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="space-y-6">
          {/* Logo / Nombre del proyecto */}
          <div className="flex items-center gap-2 py-1 px-2 select-none">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
              LT
            </div>
            {!isCollapsed && <span className="font-black text-sm tracking-wider uppercase text-slate-800 dark:text-slate-200">LETS TRIP</span>}
          </div>

          {/* Enlaces de Navegación */}
          <nav className="space-y-1.5">
            <Link 
              href="/" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 origin-left
                ${activeTab === 'calendario' 
                  ? 'bg-indigo-600 text-white shadow-md dark:shadow-none scale-[1.02]' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 hover:translate-x-1'}`}
            >
              <Calendar size={16} /> 
              {!isCollapsed && <span>Calendario</span>}
            </Link>

            <Link 
              href="/colaboradores" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 origin-left
                ${activeTab === 'colaboradores' 
                  ? 'bg-indigo-600 text-white shadow-md dark:shadow-none scale-[1.02]' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 hover:translate-x-1'}`}
            >
              <Users size={16} /> 
              {!isCollapsed && <span>Colaboradores</span>}
            </Link>

            <Link 
              href="/registro" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 origin-left
                ${activeTab === 'registro' 
                  ? 'bg-indigo-600 text-white shadow-md dark:shadow-none scale-[1.02]' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 hover:translate-x-1'}`}
            >
              <List size={16} /> 
              {!isCollapsed && <span>Registro</span>}
            </Link>
          </nav>
        </div>

        {/* SECCIÓN INFERIOR: MODO OSCURO + CERRAR SESIÓN */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          
          {/* BOTÓN MODO OSCURO */}
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-150 cursor-pointer
              ${isCollapsed ? 'justify-center' : ''}`}
          >
            {darkMode ? (
              <>
                <Sun size={16} className="text-amber-500 shrink-0" />
                {!isCollapsed && <span>Modo Claro</span>}
              </>
            ) : (
              <>
                <Moon size={16} className="text-indigo-500 shrink-0" />
                {!isCollapsed && <span>Modo Oscuro</span>}
              </>
            )}
          </button>

          {/* BOTÓN DE LOGOUT */}
          <button 
            onClick={handleLogout} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all duration-150 ease-in-out cursor-pointer
              ${isCollapsed ? 'justify-center' : 'hover:translate-x-1'}`}
          >
            <LogOut size={16} className="shrink-0" /> 
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>

      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        {children}
      </main>
    </div>
  )
}