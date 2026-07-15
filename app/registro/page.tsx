'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import SidebarLayout from '../../components/SidebarLayout'
import { useAuthTimeout } from '../../hooks/useAuthTimeout'
import { ClipboardList, Calendar, User, Tag, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RegistroPage() {
  // Cierre de sesión por inactividad a los 3 minutos (180000 ms) y al cerrar pestaña
  useAuthTimeout(180000)

  const [solicitudes, setSolicitudes] = useState<any[]>([])

  useEffect(() => {
    fetchSolicitudes()
  }, [])

  async function fetchSolicitudes() {
    const { data } = await supabase.from('solicitudes').select('*')
    if (data) setSolicitudes(data)
  }

  const calcularDias = (inicio: string, fin: string) => {
    const diff = Math.ceil((new Date(fin).getTime() - new Date(inicio).getTime()) / (1000 * 60 * 60 * 24)) + 1
    return diff > 0 ? diff : 0
  }

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset())
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // 🎨 Estilos dinámicos para Badges adaptados al Modo Claro y Modo Oscuro
  const obtenerEstiloBadge = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'vacaciones':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/60'
      case 'permiso':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/60'
      case 'ausencia':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/60'
      case 'especial':
      default:
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/60'
    }
  }

  // Variantes de animación para las filas de la tabla
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04 // Retraso secuencial entre cada fila
      }
    }
  }

  // Se añade "as const" al final de la transición spring para resolver estrictamente el tipado de TypeScript
  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 25 
      } as const
    }
  }

  return (
    <SidebarLayout activeTab="registro">
      <div className="w-full space-y-6 p-2 text-slate-900 dark:text-slate-100">
        
        {/* ENCABEZADO DE LA PÁGINA ANIMADO */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-1 py-1"
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <ClipboardList size={22} className="text-indigo-500 dark:text-indigo-400" />
            Registro
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Historial de días asignados por colaborador.</p>
        </motion.div>

        {/* TABLA ESTILIZADA PREMIUM CON ANIMACIÓN Y SOPORTE OSCURO */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 font-bold text-[10px] tracking-wider uppercase">
                  <th className="py-3 px-5 flex items-center gap-2"><User size={12} /> Colaborador</th>
                  <th className="py-3 px-4"><Tag size={12} className="inline mr-1" /> Tipo</th>
                  <th className="py-3 px-4"><Calendar size={12} className="inline mr-1" /> Período</th>
                  <th className="py-3 px-5 text-center"><Clock size={12} className="inline mr-1" /> Total Días</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs"
              >
                {solicitudes.map((sol) => (
                  <motion.tr 
                    key={sol.id} 
                    variants={rowVariants}
                    // 💡 Solución: Quitamos 'whileHover={{ className: ... }}' y aplicamos las clases de hover directamente en className
                    className="transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 group cursor-default"
                  >
                    {/* Nombre del Colaborador */}
                    <td className="py-3.5 px-5 font-bold text-slate-700 dark:text-slate-200">
                      {sol.nombre_colaborador || sol.descripcion}
                    </td>
                    
                    {/* Badge del Tipo de Evento */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border capitalize ${obtenerEstiloBadge(sol.tipo)}`}>
                        {sol.tipo === 'especial' ? '🎉 Especial' : sol.tipo}
                      </span>
                    </td>
                    
                    {/* Rango de Fechas Formateado */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                      {formatearFecha(sol.inicio)} <span className="text-slate-300 dark:text-slate-700 mx-1">→</span> {formatearFecha(sol.final)}
                    </td>
                    
                    {/* Días Totales */}
                    <td className="py-3.5 px-5 text-center">
                      <motion.span 
                        whileHover={{ scale: 1.05 }}
                        className="inline-block px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-md font-extrabold text-[11px]"
                      >
                        {calcularDias(sol.inicio, sol.final)} {calcularDias(sol.inicio, sol.final) === 1 ? 'día' : 'días'}
                      </motion.span>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>

          {/* Estado vacío con AnimatePresence */}
          <AnimatePresence>
            {solicitudes.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 bg-white dark:bg-slate-900"
              >
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No se han encontrado registros en el historial.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </SidebarLayout>
  )
}