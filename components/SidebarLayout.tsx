'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Users, List, LogOut, User, AlertCircle, ChevronLeft, ChevronRight, Code, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { logoutAction } from '@/app/login/actions'
import UserStatusCard from '@/components/UserStatusCard'

interface SidebarLayoutProps {
  children: React.ReactNode
  activeTab: 'calendario' | 'colaboradores' | 'registro'
}

export default function SidebarLayout({ children, activeTab }: SidebarLayoutProps) {
  const [usuarioEmail, setUsuarioEmail] = useState<string | null>(null)
  // 🆕 NUEVOS ESTADOS: Para guardar el nombre y rol reales desde la base de datos
  const [usuarioNombre, setUsuarioNombre] = useState<string | null>(null)
  const [usuarioRol, setUsuarioRol] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mostrarMensajeInactividad, setMostrarMensajeInactividad] = useState(false)
  
  // 🧭 CONTROL DE LA BARRA: Colapsada o expandida
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const router = useRouter()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const TIEMPO_INACTIVIDAD = 20 * 60 * 1000 

  // Cargar estado de la barra lateral desde localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar_collapsed')
    if (savedState) {
      setIsCollapsed(savedState === 'true')
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar_collapsed', String(newState))
  }

  // 1. OBTENER INFORMACIÓN DEL USUARIO Y SU ROL DE LA BD
  useEffect(() => {
    async function obtenerUsuarioYPerfil() {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
        const userPromise = supabase.auth.getUser()
        const { data: { user } }: any = await Promise.race([userPromise, timeoutPromise])
        
        if (user) {
          setUsuarioEmail(user.email || 'Usuario')
          
          // 🆕 CONSULTA A LA TABLA PERFILES: Buscamos por el ID del usuario autenticado
          const { data: perfil, error } = await supabase
            .from('perfiles')
            .select('nombre, rol')
            .eq('id', user.id)
            .single()

          if (perfil && !error) {
            setUsuarioNombre(perfil.nombre)
            setUsuarioRol(perfil.rol)
          }
        }
      } catch (error) {
        console.warn('No se pudo conectar con el servicio de autenticación:', error)
        setUsuarioEmail('Modo Local / Desconectado')
      } finally {
        setLoading(false)
      }
    }
    obtenerUsuarioYPerfil()
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

  // Iconos pequeños para cuando el menú esté colapsado
  const renderMiniRolIcon = () => {
    if (usuarioRol === 'Desarrollador') return <Code size={10} className="text-indigo-500" />
    if (usuarioRol === 'Administrador') return <ShieldCheck size={10} className="text-emerald-500" />
    return <User size={10} className="text-slate-500" />
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

      {/* 🧭 MENÚ LATERAL ANIMADO */}
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
                LETS TRIP
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

        {/* SECCIÓN INFERIOR: TARJETA DINÁMICA DE USUARIO Y LOGOUT */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          {isCollapsed ? (
            /* Vista colapsada estética */
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 relative group/avatar">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 relative">
                <User size={16} />
                <div className="absolute -bottom-1 -right-1 bg-white border border-slate-100 rounded-full p-0.5 shadow-sm">
                  {renderMiniRolIcon()}
                </div>
              </div>
              {/* Tooltip flotante con información al pasar el mouse por el mini-avatar */}
              <div className="absolute left-20 bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-md opacity-0 group-hover/avatar:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30">
                {usuarioNombre || usuarioEmail?.split('@')[0]} ({usuarioRol || 'Usuario'})
              </div>
            </div>
          ) : (
            /* 🆕 Vista expandida: Muestra tu nuevo componente premium */
            loading ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse">
                <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-2.5 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : (
              <UserStatusCard 
                name={usuarioNombre || usuarioEmail?.split('@')[0] || 'Conectado'} 
                role={usuarioRol || 'Usuario'} 
              />
            )
          )}

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

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 bg-slate-50 min-h-screen overflow-y-auto transition-all duration-300 ease-in-out">
        <main className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}