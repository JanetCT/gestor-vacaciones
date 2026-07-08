'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import SidebarLayout from '../../components/SidebarLayout'
import { Trash2, UserPlus, User, Briefcase, Globe, CheckCircle2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState('Colaborador')
  const [pais, setPais] = useState('Colombia')

  // Estado para la notificación flotante de éxito
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  // Estado para el modal de confirmación personalizado centrado
  const [modalConfirmar, setModalConfirmar] = useState<{
    isOpen: boolean;
    titulo: string;
    mensaje: string;
    idEliminar: number | null;
  }>({
    isOpen: false,
    titulo: '',
    mensaje: '',
    idEliminar: null
  })

  // Lista de colores vibrantes y profesionales
  const coloresDisponibles = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

  useEffect(() => { fetchColaboradores() }, [])

  async function fetchColaboradores() {
    const { data } = await supabase
      .from('colaboradores')
      .select('*')
      .order('nombre', { ascending: true })
    
    if (data) setColaboradores(data)
  }

  const handleAgregar = async () => {
    if (!nombre.trim()) return
    
    const colorAleatorio = coloresDisponibles[Math.floor(Math.random() * coloresDisponibles.length)]
    
    const { error } = await supabase
      .from('colaboradores')
      .insert([{ nombre, rol, pais, color: colorAleatorio }])
    
    if (!error) {
      setNombre('')
      mostrarAlertaExito(`¡${nombre} se ha agregado con éxito!`)
      fetchColaboradores()
    } else {
      console.error("Error al insertar:", error)
    }
  }

  const handlePreEliminar = (id: number, nombreColab: string) => {
    setModalConfirmar({
      isOpen: true,
      titulo: 'Eliminar Colaborador',
      mensaje: `¿Estás seguro de que deseas eliminar permanentemente a "${nombreColab}"? Se borrará de la base de datos.`,
      idEliminar: id
    })
  }

  const ejecutarEliminar = async () => {
    if (modalConfirmar.idEliminar === null) return

    const { error } = await supabase
      .from('colaboradores')
      .delete()
      .eq('id', modalConfirmar.idEliminar)

    if (!error) {
      cerrarModal()
      mostrarAlertaExito("Colaborador eliminado correctamente")
      fetchColaboradores()
    }
  }

  const cerrarModal = () => {
    setModalConfirmar(prev => ({ ...prev, isOpen: false, idEliminar: null }))
  }

  const mostrarAlertaExito = (mensaje: string) => {
    setMensajeExito(mensaje)
    setTimeout(() => {
      setMensajeExito(null)
    }, 3000)
  }

  const obtenerIniciales = (name: string) => {
    const nombres = name.split(' ')
    if (nombres.length >= 2) {
      return `${nombres[0].charAt(0)}${nombres[1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  return (
    <SidebarLayout activeTab="colaboradores">
      {/* ✨ CONTENEDOR ANIMADO PRINCIPAL DE LA PÁGINA */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="w-full space-y-6 p-2 relative"
      >
        
        {/* ========================================================= */}
        {/* DIÁLOGO/MODAL DE CONFIRMACIÓN PERSONALIZADO (AL MEDIO)   */}
        {/* ========================================================= */}
        <AnimatePresence>
          {modalConfirmar.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={cerrarModal}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-sm p-5 relative z-10 space-y-4"
              >
                <button 
                  onClick={cerrarModal}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl shrink-0 bg-rose-50 text-rose-600">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">{modalConfirmar.titulo}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{modalConfirmar.mensaje}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1.5 justify-end">
                  <button
                    onClick={cerrarModal}
                    className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={ejecutarEliminar}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-100 transition-all"
                  >
                    Confirmar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* NOTIFICACIÓN ANIMADA FLOTANTE DE ÉXITO (AL MEDIO)        */}
        {/* ========================================================= */}
        <AnimatePresence>
          {mensajeExito && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/5 backdrop-blur-[0.5px]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                className="bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto z-10"
              >
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span className="text-xs font-bold tracking-wide pr-1 whitespace-nowrap">{mensajeExito}</span>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {/* ENCABEZADO DE LA PÁGINA */}
        <div className="flex flex-col gap-1 py-1">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Colaboradores</h1>
        </div>
        
        {/* FORMULARIO ESTILO TOP-PANEL */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          <div className="relative flex items-center lg:col-span-2">
            <User size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input 
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all" 
              placeholder="Nombre completo" 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
            />
          </div>

          <div className="relative flex items-center">
            <Briefcase size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
            <select 
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer" 
              value={rol} 
              onChange={e => setRol(e.target.value)}
            >
              <option value="Colaborador">Colaborador</option>
            </select>
          </div>

          <div className="relative flex items-center">
            <Globe size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
            <select 
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer" 
              value={pais} 
              onChange={e => setPais(e.target.value)}
            >
              <option value="Colombia">Colombia</option>
              <option value="Mexico">México</option>
            </select>
          </div>

          <button 
            onClick={handleAgregar} 
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <UserPlus size={14} /> 
            Agregar
          </button>
        </div>

        {/* LISTA DE COLABORADORES CON ANIMACIÓN POR TARJETA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colaboradores.map((colab, index) => (
            <motion.div 
              key={colab.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3), ease: 'easeOut' }}
              className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between hover:border-slate-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-black text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: colab.color }}
                >
                  {obtenerIniciales(colab.nombre)}
                </div>
                
                <div className="min-w-0">
                  <span className="font-bold text-xs text-slate-700 block truncate">{colab.nombre}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                      {colab.rol}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      • {colab.pais}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handlePreEliminar(colab.id, colab.nombre)} 
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-60 group-hover:opacity-100"
                title="Eliminar colaborador"
              >
                <Trash2 size={15} />
              </button>
            </motion.div>
          ))}
        </div>

        {colaboradores.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400 font-medium">No hay colaboradores registrados todavía.</p>
          </div>
        )}

      </motion.div>
    </SidebarLayout>
  )
}