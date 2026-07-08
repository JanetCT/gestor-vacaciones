'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Users, List, LogOut, User, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { logoutAction } from '@/app/login/actions'

interface SidebarLayoutProps {
  children: React.ReactNode
  activeTab: 'calendario' | 'colaboradores' | 'registro'
}

export default function SidebarLayout({ children, activeTab }: SidebarLayoutProps) {
  const [usuarioEmail, setUsuarioEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mostrarMensajeInactividad, setMostrarMensajeInactividad] = useState(false)
  
  // 🧭 NUEVO ESTADO: Controla si la barra está colapsada o expandida
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const router = useRouter()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const TIEMPO_INACTIVIDAD = 20 * 60 * 1000 

  // Cargar estado de la barra lateral desde localStorage para mantener la elección del usuario
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar_collapsed')
    if (savedState) {
      setIsCollapsed(savedState === 'true')
    }
  }, [])

  // Guardar estado en localStorage cuando cambie
  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar_collapsed', String(newState))
  }

  // 1. OBTENER INFORMACIÓN DEL USUARIO
  useEffect(() => {
    async function obtenerUsuario() {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
        const userPromise = supabase.auth.getUser()
        const { data: { user } }: any = await Promise.race([userPromise, timeoutPromise])
        
        if (user) {
          setUsuarioEmail(user.email || 'Usuario')
        }
      } catch (error) {
        console.warn('No se pudo conectar con el servicio de autenticación:', error)
        setUsuarioEmail('Modo Local / Desconectado')
      } finally {
        setLoading(false)
      }
    }
    obtenerUsuario()
  }, [])

  // 2. CONTROL DE INACTIVIDAD
  const cerrarSesionPorInactividad = async () => {
    try {
      await logoutAction()
      await supabase.auth.signOut()
      setMostrarMensajeInactividad(true)
      setTimeout(() => {
        router.push('/login?reason=timeout')
        router.refresh()
      }, 4000)
    } catch (error) {
      console.error('Error al cerrar sesión por inactividad:', error)
      window.location.href = '/login?reason=timeout'
    }
  }

  useEffect(() => {
    const reiniciarTemporizador = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (mostrarMensajeInactividad) return

      timerRef.current = setTimeout(() => {
        cerrarSesionPorInactividad()
      }, TIEMPO_INACTIVIDAD)
    }

    const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    eventos.forEach(evento => window.addEventListener(evento, reiniciarTemporizador))
    reiniciarTemporizador()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      eventos.forEach(evento => window.removeEventListener(evento, reiniciarTemporizador))
    }
  }, [mostrarMensajeInactividad])

  const handleLogout = async () => {
    await logoutAction()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased relative">
      
      {/* ALERTA DE INACTIVIDAD */}
      {mostrarMensajeInactividad && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 max-w-sm w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto animate-bounce">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-base">Sesión expirada</h3>
              <p className="text-xs text-slate-500">
                Tu sesión se ha cerrado automáticamente debido a 20 minutos de inactividad por motivos de seguridad.
              </p>
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold animate-pulse">
              Redirigiendo al inicio de sesión...
            </div>
          </div>
        </div>
      )}

      {/* 🧭 MENÚ LATERAL ANMADO (Se expande a w-64 o se contrae a w-20) */}
      <aside 
        className={`bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shrink-0 relative transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* 🔘 BOTÓN FLOTANTE PARA EXPANDIR/OCULTAR */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-7 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 shadow-sm hover:shadow-md transition-all z-10"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="space-y-6">
          {/* Logo / Icono principal */}
          <div className={`flex items-center gap-2 py-1 ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}>
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm shadow-indigo-200 shrink-0">
              LT
            </div>
            {!isCollapsed && (
              <span className="font-black text-sm tracking-wider uppercase text-slate-800 transition-opacity duration-200">
                LETS TRIP.
              </span>
            )}
          </div>

          {/* Enlaces de Navegación */}
          <nav className="space-y-1">
            <Link 
              href="/" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                isCollapsed ? 'justify-center' : ''
              } ${
                activeTab === 'calendario' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={isCollapsed ? "Calendario" : ""}
            >
              <Calendar size={16} className="shrink-0" />
              {!isCollapsed && <span className="truncate">Calendario</span>}
            </Link>

            <Link 
              href="/colaboradores" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                isCollapsed ? 'justify-center' : ''
              } ${
                activeTab === 'colaboradores' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={isCollapsed ? "Colaboradores" : ""}
            >
              <Users size={16} className="shrink-0" />
              {!isCollapsed && <span className="truncate">Colaboradores</span>}
            </Link>

            <Link 
              href="/registro" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                isCollapsed ? 'justify-center' : ''
              } ${
                activeTab === 'registro' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={isCollapsed ? "Registro" : ""}
            >
              <List size={16} className="shrink-0" />
              {!isCollapsed && <span className="truncate">Registro</span>}
            </Link>
          </nav>
        </div>

        {/* SECCIÓN INFERIOR: USUARIO Y LOGOUT */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <User size={16} />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1 transition-opacity duration-200">
                {loading ? (
                  <div className="space-y-1.5 animate-pulse py-0.5">
                    <div className="h-2.5 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-bold text-slate-700 truncate">
                      {usuarioEmail?.split('@')[0] || 'Conectado'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {usuarioEmail || 'Sesión activa'}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors group ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? "Cerrar Sesión" : ""}
          >
            <LogOut size={16} className="text-slate-400 group-hover:text-rose-500 transition-colors shrink-0" />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL (Se adapta automáticamente al ancho del Sidebar) */}
      <div className="flex-1 bg-slate-50 min-h-screen overflow-y-auto transition-all duration-300 ease-in-out">
        <main className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}