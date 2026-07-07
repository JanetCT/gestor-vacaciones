'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Users, List, LogOut, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { logoutAction } from '@/app/login/actions'

interface SidebarLayoutProps {
  children: React.ReactNode
  activeTab: 'calendario' | 'colaboradores' | 'registro'
}

export default function SidebarLayout({ children, activeTab }: SidebarLayoutProps) {
  const [usuarioEmail, setUsuarioEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function obtenerUsuario() {
      try {
        // Control de tiempo por si Supabase no responde en entornos de desarrollo/despliegue
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )

        const userPromise = supabase.auth.getUser()
        
        // Ejecuta la consulta con un límite de 3 segundos
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

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* MENÚ LATERAL */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          {/* Logo / Nombre de la app */}
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm shadow-indigo-200">
              LT
            </div>
            <span className="font-black text-sm tracking-wider uppercase text-slate-800">LETS TRIP.</span>
          </div>

          {/* Enlaces de Navegación */}
          <nav className="space-y-1">
            <Link 
              href="/" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                activeTab === 'calendario' 
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Calendar size={16} />
              Calendario
            </Link>

            <Link 
              href="/colaboradores" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                activeTab === 'colaboradores' 
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Users size={16} />
              Colaboradores
            </Link>

            <Link 
              href="/registro" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                activeTab === 'registro' 
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <List size={16} />
              Registro
            </Link>
          </nav>
        </div>

        {/* SECCIÓN INFERIOR: USUARIO Y LOGOUT */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <User size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-700 truncate">
                {loading ? 'Conectando...' : (usuarioEmail?.split('@')[0] || 'Conectado')}
              </p>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {loading ? 'Sincronizando...' : (usuarioEmail || 'Sesión activa')}
              </p>
            </div>
          </div>

          <button 
            onClick={() => logoutAction()}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors group"
          >
            <LogOut size={16} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL CON FONDO GRIS CLARO ASEGURADO EN TODO EL ANCHO */}
      <div className="flex-1 bg-slate-50 min-h-screen overflow-y-auto">
        <main className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}