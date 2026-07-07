'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, List, LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logoutAction } from '@/app/login/actions'; 
import { usePathname, useRouter } from 'next/navigation';

export default function SidebarLayout({ children, activeTab }: { children: React.ReactNode, activeTab?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  // Estado para almacenar el usuario logueado
  const [usuario, setUsuario] = useState<any>(null);

  // Deducir la pestaña activa de manera segura
  const currentTab = activeTab || 
    (pathname === '/' ? 'calendario' : pathname?.replace('/', ''));

  // CONTROL ULTRA-ESTABLE DE SESIÓN (Detiene bucles infinitos)
  useEffect(() => {
    let unmounted = false;

    async function chequearUsuario() {
      try {
        // 1. Intentamos obtener la sesión local rápidamente
        const { data: { session } } = await supabase.auth.getSession();
        
        if (unmounted) return;

        if (session?.user) {
          setUsuario(session.user);
        } else {
          // 2. Respaldo silencioso: si está fría, le preguntamos al servidor una única vez
          const { data: { user } } = await supabase.auth.getUser();
          if (user && !unmounted) {
            setUsuario(user);
          }
        }
      } catch (error) {
        console.error('Error verificando sesión inicial:', error);
      }
    }

    chequearUsuario();

    // 3. El Listener SOLO actúa si el evento es un cierre de sesión explícito
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (unmounted) return;

      if (session?.user) {
        setUsuario(session.user);
      } else if (event === 'SIGNED_OUT') {
        // Solo si el usuario le dio clic a "Cerrar sesión" destruimos el estado
        setUsuario(null);
        window.location.href = '/login';
      }
    });

    return () => {
      unmounted = true;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Cierre de sesión seguro destruyendo cookies
  const handleLogout = async () => {
    try {
      await logoutAction();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = [
    { id: 'calendario', label: 'Calendario', icon: Calendar, href: '/' },
    { id: 'colaboradores', label: 'Colaboradores', icon: Users, href: '/colaboradores' },
    { id: 'registro', label: 'Registro', icon: List, href: '/registro' }
  ];

  // Función optimizada para procesar y limpiar el nombre
  const obtenerNombreMostrar = () => {
    if (!usuario) return 'Usuario';
    if (usuario.user_metadata?.full_name) return usuario.user_metadata.full_name;
    if (usuario.user_metadata?.name) return usuario.user_metadata.name;
    return usuario.email?.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') || 'Admin';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased">
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="w-60 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0 z-10">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 mb-8 select-none">
            <span className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-black tracking-wider">
              LT
            </span>
            <h1 className="text-sm font-bold tracking-widest text-slate-900">
              LETS TRIP<span className="text-indigo-600">.</span>
            </h1>
          </div>

          {/* Navegación */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <Link key={item.id} href={item.href} className="block relative group">
                  <motion.div 
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all relative z-10 ${
                      isActive 
                        ? 'text-white font-semibold' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <item.icon 
                      size={16} 
                      className={`transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'
                      }`} 
                    /> 
                    <span className="tracking-wide">{item.label}</span>

                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-sm shadow-indigo-600/20"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* CONTENEDOR DE LA PARTE INFERIOR (Perfil + Cerrar Sesión) */}
        <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
          
          {/* TARJETA DEL USUARIO LOGUEADO */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 select-none">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <User size={14} />
            </div>
            <div className="min-w-0 flex flex-col w-full">
              <span className="text-[11px] font-bold text-slate-700 capitalize truncate">
                {usuario ? obtenerNombreMostrar() : 'Conectando...'}
              </span>
              <span className="text-[9px] text-slate-400 truncate font-medium">
                {usuario ? usuario.email : 'Sincronizando...'}
              </span>
            </div>
          </div>

          {/* Botón de Cerrar Sesión */}
          <motion.button 
            whileHover={{ x: 3 }}
            onClick={handleLogout} 
            className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-rose-600 text-xs font-medium rounded-xl hover:bg-rose-50 transition-all group w-full"
          >
            <LogOut size={16} className="text-slate-400 group-hover:text-rose-500 transition-colors" /> 
            <span className="tracking-wide">Cerrar Sesión</span>
          </motion.button>
        </div>

      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <div className="w-full max-w-7xl mx-auto px-6 py-8 flex-1 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col flex-1"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
}