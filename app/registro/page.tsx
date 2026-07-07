'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import SidebarLayout from '../../components/SidebarLayout'
import { ClipboardList, Calendar, User, Tag, Clock } from 'lucide-react'

export default function RegistroPage() {
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

  // Formatea las fechas para que se vean profesionales (ej: 01 jul 2026)
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset()) // Ajuste de zona horaria
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Estilos dinámicos para los badges de tipos de ausencia
  const obtenerEstiloBadge = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'vacaciones':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      case 'permiso':
        return 'bg-blue-50 text-blue-700 border-blue-100'
      case 'ausencia':
        return 'bg-rose-50 text-rose-700 border-rose-100'
      case 'especial':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100'
    }
  }

  return (
    <SidebarLayout activeTab="registro">
      <div className="w-full space-y-6 p-2">
        
        {/* ENCABEZADO DE LA PÁGINA */}
        <div className="flex flex-col gap-1 py-1">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardList size={22} className="text-indigo-500" />
            Registro
          </h2>
          <p className="text-xs text-slate-400">Historial de días asignados por colaborador.</p>
        </div>

        {/* TABLA ESTILIZADA PREMIUM */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/60 text-slate-400 font-bold text-[10px] tracking-wider uppercase">
                  <th className="py-3 px-5 flex items-center gap-2"><User size={12} /> Colaborador</th>
                  <th className="py-3 px-4"><Tag size={12} className="inline mr-1" /> Tipo</th>
                  <th className="py-3 px-4"><Calendar size={12} className="inline mr-1" /> Período</th>
                  <th className="py-3 px-5 text-center"><Clock size={12} className="inline mr-1" /> Total Días</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {solicitudes.map((sol) => (
                  <tr key={sol.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Nombre del Colaborador */}
                    <td className="py-3.5 px-5 font-bold text-slate-700">
                      {sol.nombre_colaborador || sol.descripcion}
                    </td>
                    
                    {/* Badge del Tipo de Evento */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border capitalize ${obtenerEstiloBadge(sol.tipo)}`}>
                        {sol.tipo === 'especial' ? '🎉 Especial' : sol.tipo}
                      </span>
                    </td>
                    
                    {/* Rango de Fechas Formateado */}
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {formatearFecha(sol.inicio)} <span className="text-slate-300 mx-1">→</span> {formatearFecha(sol.final)}
                    </td>
                    
                    {/* Días Totales */}
                    <td className="py-3.5 px-5 text-center">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-md font-extrabold text-[11px]">
                        {calcularDias(sol.inicio, sol.final)} {calcularDias(sol.inicio, sol.final) === 1 ? 'día' : 'días'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Estado vacío si no hay solicitudes registradas */}
          {solicitudes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xs text-slate-400 font-medium">No se han encontrado registros en el historial.</p>
            </div>
          )}
        </div>

      </div>
    </SidebarLayout>
  )
}