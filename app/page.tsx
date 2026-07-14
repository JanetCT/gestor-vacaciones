'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import SidebarLayout from '../components/SidebarLayout'
import { useAuthTimeout } from '../hooks/useAuthTimeout'
import { ChevronLeft, ChevronRight, CalendarDays, User, PlusCircle, Bookmark, Calendar, CheckCircle2, AlertTriangle, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Solicitud {
  id: number
  nombre_colaborador: string | null
  inicio: string
  final: string
  tipo: string
  descripcion: string
}

interface Colaborador {
  nombre: string
}

export default function CalendarPage() {
  useAuthTimeout(180000) 

  const [currentDate, setCurrentDate] = useState(new Date())
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [listaColaboradores, setListaColaboradores] = useState<Colaborador[]>([])
  const [formData, setFormData] = useState({ nombre: '', inicio: '', fin: '', tipo: 'vacaciones', desc: '' })
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  const [modalConfirmar, setModalConfirmar] = useState<{
    isOpen: boolean;
    tipoAccion: 'guardar' | 'eliminar' | null;
    titulo: string;
    mensaje: string;
    datosTemporales?: any;
  }>({
    isOpen: false,
    tipoAccion: null,
    titulo: '',
    mensaje: ''
  })

  const tituloMes = currentDate.toLocaleDateString('es-ES', { 
    month: 'long', year: 'numeric' 
  })

  const generarColor = (nombre: string) => {
    if (!nombre) return '#6366f1';
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  }

  useEffect(() => { 
    fetchSolicitudes()
    fetchColaboradores() 
  }, [])

  async function fetchSolicitudes() {
    const { data } = await supabase.from('solicitudes').select('*')
    if (data) setSolicitudes(data as Solicitud[])
  }

  async function fetchColaboradores() {
    const { data } = await supabase.from('colaboradores').select('nombre')
    if (data) setListaColaboradores(data as Colaborador[])
  }

  const handlePreEliminar = (id: number, nombreAsignado: string) => {
    setModalConfirmar({
      isOpen: true,
      tipoAccion: 'eliminar',
      titulo: 'Eliminar Registro',
      mensaje: `¿Estás seguro de que deseas eliminar permanentemente el registro de "${nombreAsignado}"?`,
      datosTemporales: { id }
    })
  }

  const ejecutarEliminar = async (id: number) => {
    const { error } = await supabase.from('solicitudes').delete().eq('id', id)
    if (!error) {
      cerrarModal()
      mostrarAlertaExito("Registro eliminado correctamente")
      fetchSolicitudes()
    }
  }

  const handlePreGuardar = () => {
    if (!formData.inicio || !formData.fin) return
    
    const fechaInicio = new Date(formData.inicio + 'T00:00:00')
    const fechaFin = new Date(formData.fin + 'T00:00:00')

    if (fechaFin < fechaInicio) {
      alert("La fecha de término no puede ser anterior a la fecha de inicio.");
      return;
    }

    const sujeto = formData.nombre || formData.desc || "Evento"
    setModalConfirmar({
      isOpen: true,
      tipoAccion: 'guardar',
      titulo: 'Confirmar Registro',
      mensaje: `¿Confirmas el registro de ${formData.tipo} para "${sujeto}"?`
    })
  }

  const ejecutarGuardar = async () => {
    const { error } = await supabase.from('solicitudes').insert([{
      nombre_colaborador: formData.nombre || null,
      inicio: formData.inicio,
      final: formData.fin,
      tipo: formData.tipo,
      descripcion: formData.desc
    }])
    
    if (!error) {
      setFormData({ nombre: '', inicio: '', fin: '', tipo: 'vacaciones', desc: '' })
      cerrarModal()
      mostrarAlertaExito("¡Registrado con éxito!")
      fetchSolicitudes()
    }
  }

  const cerrarModal = () => {
    setModalConfirmar(prev => ({ ...prev, isOpen: false }))
  }

  const mostrarAlertaExito = (mensaje: string) => {
    setMensajeExito(mensaje)
    setTimeout(() => {
      setMensajeExito(null)
    }, 3000)
  }

  const diasEnMes = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const primerDia = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  return (
    <SidebarLayout activeTab="calendario">
      <div className="w-full space-y-6 relative text-slate-900 dark:text-slate-100">
        
        {/* MODAL DE CONFIRMACIÓN */}
        <AnimatePresence>
          {modalConfirmar.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={cerrarModal}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-black/60"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl w-full max-w-sm p-5 relative z-10 space-y-4"
              >
                <button 
                  onClick={cerrarModal}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>

                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    modalConfirmar.tipoAccion === 'eliminar' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {modalConfirmar.tipoAccion === 'eliminar' ? <Trash2 size={18} /> : <AlertTriangle size={18} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">{modalConfirmar.titulo}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{modalConfirmar.mensaje}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1.5 justify-end">
                  <button
                    onClick={cerrarModal}
                    className="px-3.5 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (modalConfirmar.tipoAccion === 'guardar') ejecutarGuardar()
                      if (modalConfirmar.tipoAccion === 'eliminar') ejecutarEliminar(modalConfirmar.datosTemporales?.id)
                    }}
                    className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all cursor-pointer ${
                      modalConfirmar.tipoAccion === 'eliminar' 
                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100 dark:shadow-none' 
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none'
                    }`}
                  >
                    Confirmar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* NOTIFICACIÓN ANIMADA */}
        <AnimatePresence>
          {mensajeExito && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/5 backdrop-blur-[0.5px] dark:bg-black/20"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                className="bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto z-10"
              >
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span className="text-xs font-bold tracking-wide pr-1 whitespace-nowrap">{mensajeExito}</span>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {/* PANEL DE ASIGNACIÓN */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3.5 items-end transition-colors">
          <div className="relative flex flex-col gap-1 w-full">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wide px-1 select-none">Empleado</span>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <select 
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all appearance-none cursor-pointer" 
                value={formData.nombre} 
                onChange={e => setFormData({...formData, nombre: e.target.value})}
              >
                <option value="">Seleccionar</option>
                {listaColaboradores.map((c) => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
              </select>
            </div>
          </div>
          
          <div className="relative flex flex-col gap-1 w-full">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wide px-1 select-none">Descripción del Motivo</span>
            <div className="relative flex items-center">
              <Bookmark size={16} className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Evento especial" 
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all" 
                value={formData.desc}
                onChange={e => setFormData({...formData, desc: e.target.value})}
              />
            </div>
          </div>

          <div className="relative flex flex-col gap-1 w-full">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wide px-1 select-none">Tipo de Ausencia</span>
            <div className="relative flex items-center">
              <CalendarDays size={16} className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <select 
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all appearance-none cursor-pointer" 
                value={formData.tipo} 
                onChange={e => setFormData({...formData, tipo: e.target.value})}
              >
                <option value="vacaciones">Vacaciones</option>
                <option value="permisos">Permisos personales</option>
                <option value="licencias">Licencias</option>
                <option value="homeoffice">Home Office</option>
                <option value="incapacidades">Incapacidades</option>
                <option value="horas_extras">Horas extras</option>
                <option value="cubrimientos">Cubrimientos operativos</option>
                <option value="dia_especial">Días Especiales</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 w-full">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wide px-1 select-none">Fecha de inicio</span>
            <input 
              type="date" 
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer" 
              value={formData.inicio} 
              onChange={e => setFormData({...formData, inicio: e.target.value})} 
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wide px-1 select-none">Fecha de término</span>
            <input 
              type="date" 
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer" 
              value={formData.fin} 
              onChange={e => setFormData({...formData, fin: e.target.value})} 
            />
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePreGuardar} 
            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 h-[41px] cursor-pointer"
          >
            <PlusCircle size={15} />
            Registrar
          </motion.button>
        </div>

        {/* CABECERA DEL MES */}
        <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm p-2 rounded-2xl border border-slate-200/40 dark:border-slate-800/60">
          <h2 className="text-lg font-extrabold capitalize text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2 px-3">
            <Calendar size={18} className="text-indigo-500" />
            {tituloMes}
          </h2>
          <div className="flex bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl items-center gap-0.5">
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} 
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-all active:scale-95 shadow-none hover:shadow-sm cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} 
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-all active:scale-95 shadow-none hover:shadow-sm cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* CALENDARIO */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm transition-colors|">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map(d => (
              <div key={d} className="text-center text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider py-1 select-none">
                {d}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2.5">
            {Array.from({ length: primerDia }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 bg-slate-50/40 dark:bg-slate-950/20 rounded-2xl border border-slate-100/50 dark:border-slate-800/40" />
            ))}
            
            {Array.from({ length: diasEnMes }).map((_, i) => {
              const dia = i + 1
              const fechaCelda = new Date(currentDate.getFullYear(), currentDate.getMonth(), dia)
              
              fechaCelda.setHours(0, 0, 0, 0)
              
              const diaSemana = fechaCelda.getDay()
              const esFinDeSemana = diaSemana === 0 || diaSemana === 6

              const sol = solicitudes.find(s => {
                const inicio = new Date(s.inicio + 'T00:00:00');
                const fin = new Date(s.final + 'T00:00:00');
                const start = inicio < fin ? inicio : fin;
                const end = inicio < fin ? fin : inicio;
                
                return fechaCelda >= start && fechaCelda <= end
              })

              const nombreColaborador = sol ? sol.nombre_colaborador : '';
              const tipoAusencia = sol 
                ? (sol.tipo === 'especial' ? sol.descripcion : sol.tipo.charAt(0).toUpperCase() + sol.tipo.slice(1))
                : '';

              const esHoy = new Date().getDate() === dia && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

              const obtenerBadgeTipo = (tipo: string) => {
                switch (tipo) {
                  case 'vacaciones': return { label: ' Vacaciones', color: '#10b981' };
                  case 'permiso': return { label: ' Permiso', color: '#3b82f6' };
                  case 'ausencia': return { label: ' Ausencia', color: '#ef4444' };
                  default: return { label: ' Evento Especial', color: '#f59e0b' };
                }
              };

              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, delay: Math.min(i * 0.015, 0.3) }}
                  className={`h-24 p-2 rounded-2xl border flex flex-col justify-between relative group transform transition-all duration-200 ${
                    esHoy 
                      ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20 shadow-sm shadow-indigo-100 dark:shadow-none' 
                      : esFinDeSemana
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/40 shadow-inner' 
                        : 'border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 hover:border-slate-300/80 dark:hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  <span className={`text-xs font-bold select-none ${
                    esHoy 
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100/80 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded-md w-fit' 
                      : esFinDeSemana 
                        ? 'text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800/60 px-1.5 py-0.5 rounded-md w-fit text-[11px]' 
                        : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {dia}
                  </span>

                  {sol && (
                    <div className="relative w-full mt-auto">
                      <div 
                        className="text-white px-2.5 py-1.5 rounded-xl cursor-pointer transition-all hover:brightness-105 flex flex-col gap-0.5 shadow-sm pr-7 relative group/badge overflow-hidden" 
                        style={{ backgroundColor: sol.tipo === 'especial' ? '#f59e0b' : generarColor(sol.nombre_colaborador ?? '') }}
                      >
                        <span className="text-[11px] font-bold truncate tracking-wide leading-tight">
                          {nombreColaborador || sol.descripcion}
                        </span>
                        
                        <span className="text-[9px] font-medium opacity-85 truncate leading-tight">
                          {tipoAusencia}
                        </span>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePreEliminar(sol.id, nombreColaborador || sol.descripcion); }} 
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/10 hover:bg-black/30 text-white rounded-md w-4 h-4 flex items-center justify-center text-[8px] font-black transition-colors z-10 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* TOOLTIP EMERGENTE */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 w-52 p-3.5 bg-slate-950/95 dark:bg-slate-900 text-white text-xs rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 border border-slate-800 dark:border-slate-700 backdrop-blur-md scale-95 group-hover:scale-100 transform origin-bottom flex flex-col gap-1.5">
                        <div className="font-extrabold text-sm tracking-tight border-b border-slate-800 dark:border-slate-700 pb-1.5 text-slate-100 truncate">
                          {nombreColaborador || sol.descripcion}
                        </div>
                        
                        <div className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                          <span 
                            className="w-2 h-2 rounded-full inline-block shrink-0" 
                            style={{ backgroundColor: obtenerBadgeTipo(sol.tipo).color }}
                          />
                          {obtenerBadgeTipo(sol.tipo).label}
                        </div>

                        {sol.descripcion && sol.tipo !== 'especial' && (
                          <div className="text-[10px] text-slate-400 bg-slate-900 dark:bg-slate-950 px-2 py-1 rounded-lg italic truncate">
                            "{sol.descripcion}"
                          </div>
                        )}

                        <div className="mt-1 text-[10px] font-mono text-slate-400 flex justify-between items-center bg-slate-900/60 dark:bg-slate-950/60 px-2 py-1 rounded-lg">
                          <span>{sol.inicio}</span>
                          <span className="text-slate-600 dark:text-slate-500 text-[9px] lowercase font-sans">al</span>
                          <span>{sol.final}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

      </div>
    </SidebarLayout>
  )
}