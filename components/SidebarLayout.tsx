'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Users, List, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { logoutAction } from '@/app/login/actions'

interface SidebarLayoutProps {
  children: React.ReactNode
  activeTab: 'calendario' | 'colaboradores' | 'registro'
}

export default function SidebarLayout({ children, activeTab }: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const savedState = localStorage.getItem('sidebar_collapsed')
    if (savedState) setIsCollapsed(savedState === 'true')
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar_collapsed', String(newState))
  }

  const handleLogout = async () => {
    await logoutAction()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased relative">
      
      {/* 🧭 MENÚ LATERAL */}
      <aside className={`bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shrink-0 relative transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
        
        {/* 🔘 BOTÓN FLOTANTE PARA EXPANDIR/OCULTAR */}
        <button onClick={toggleSidebar} className="absolute -right-3 top-7 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:scale-110 shadow-sm z-10 transition-all duration-200">
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="space-y-6">
          {/* Logo / Nombre del proyecto */}
          <div className="flex items-center gap-2 py-1 px-2 select-none">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm animate-pulse">LT</div>
            {!isCollapsed && <span className="font-black text-sm tracking-wider uppercase text-slate-800">LETS TRIP</span>}
          </div>

          {/* Enlaces de Navegación con Animación Suave */}
          <nav className="space-y-1.5">
            <Link 
              href="/" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ease-in-out origin-left
                ${activeTab === 'calendario' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'}`}
            >
              <Calendar size={16} className={`transition-transform duration-300 ${activeTab === 'calendario' ? '' : 'group-hover:scale-110'}`} /> 
              {!isCollapsed && <span>Calendario</span>}
            </Link>

            <Link 
              href="/colaboradores" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ease-in-out origin-left
                ${activeTab === 'colaboradores' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'}`}
            >
              <Users size={16} /> 
              {!isCollapsed && <span>Colaboradores</span>}
            </Link>

            <Link 
              href="/registro" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ease-in-out origin-left
                ${activeTab === 'registro' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'}`}
            >
              <List size={16} /> 
              {!isCollapsed && <span>Registro</span>}
            </Link>
          </nav>
        </div>

        {/* SECCIÓN INFERIOR: BOTÓN DE LOGOUT ANIMADO */}
        <div className="pt-4 border-t border-slate-100">
          <button 
            onClick={handleLogout} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all duration-300 ease-in-out
              ${isCollapsed ? 'justify-center' : 'hover:translate-x-1'}`}
          >
            <LogOut size={16} className="transition-transform duration-300 group-hover:-translate-x-0.5" /> 
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}