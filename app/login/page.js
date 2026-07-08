'use client'
import { useState } from 'react'
import { loginAction } from './actions' // <-- Importamos la Server Action
import { CheckCircle2, AlertCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false) // Nuevo estado para ver contraseña
  const [loading, setLoading] = useState(false)
  const [mensajeExito, setMensajeExito] = useState(null)
  const [mensajeError, setMensajeError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensajeError(null) 
    
    // Ejecutamos el login de forma segura en el servidor
    const resultado = await loginAction(email, password)
    
    if (!resultado.success) {
      setMensajeError(resultado.error)
      setLoading(false)
    } else {
      setMensajeExito('¡Inicio de sesión exitoso!')
      setTimeout(() => {
        window.location.href = '/'
      }, 800)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 px-4 relative select-none font-sans antialiased">
      
      {/* ALERTA DE ÉXITO */}
      <AnimatePresence>
        {mensajeExito && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }} className="bg-slate-900 border border-slate-800 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto z-10">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span className="text-xs font-bold tracking-wide pr-1 whitespace-nowrap">{mensajeExito}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ALERTA DE ERROR */}
      <AnimatePresence>
        {mensajeError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMensajeError(null)} className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm pointer-events-auto" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="bg-white border border-slate-200 text-slate-800 px-5 py-4 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-xs gap-3 pointer-events-auto z-10">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-600"><AlertCircle size={20} /></div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800">Error de Autenticación</h4>
                <p className="text-[11px] text-slate-400 leading-normal">{mensajeError}</p>
              </div>
              <button type="button" onClick={() => setMensajeError(null)} className="w-full mt-1 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-[11px] font-bold rounded-xl transition-colors">Entendido</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TARJETA DE LOGIN CON ANIMACIÓN DE ENTRADA SUAVE */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm w-full max-w-md z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-6 select-none">
          <span className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black tracking-wider shrink-0">LT</span>
          <h1 className="text-sm font-bold tracking-widest text-slate-900 uppercase">LETS TRIP<span className="text-indigo-600">.</span></h1>
        </div>
        
        <p className="text-[11px] text-slate-400 text-center mb-6 font-medium tracking-wide">Ingresa tus credenciales para acceder</p>

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* CAMPO CORREO */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Correo Electrónico</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input 
                type="email" 
                required 
                placeholder="ejemplo@empresa.com" 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all bg-slate-50 focus:ring-2 focus:ring-indigo-100" 
              />
            </div>
          </div>

          {/* CAMPO CONTRASEÑA */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Contraseña</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                placeholder="••••••••" 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-10 pr-11 py-2.5 border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all bg-slate-50 focus:ring-2 focus:ring-indigo-100" 
              />
              {/* Botón Ojo para mostrar/ocultar */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.99 }} 
            type="submit" 
            disabled={loading} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed mt-5 shadow-sm shadow-indigo-600/10 flex items-center justify-center tracking-wide"
          >
            {loading ? 'Verificando datos...' : 'Ingresar'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}