'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase' // Ajusta esta ruta si tu archivo de supabase está en otro lugar

// Tiempo límite por defecto: 15 minutos (15 * 60 * 1000)
const TIEMPO_DEFAULT = 15 * 60 * 1000

export function useAuthTimeout(tiempoLimite: number = TIEMPO_DEFAULT) {
  const router = useRouter()
  const tiempoInactividadRef = useRef<NodeJS.Timeout | null>(null)

  const cerrarSesionSistema = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.clear() 
      router.push('/login')
    } catch (error) {
      console.error("Error al cerrar sesión por inactividad/cierre:", error)
    }
  }

  useEffect(() => {
    // ==========================================
    // 1. CONTROL DE INACTIVIDAD
    // ==========================================
    const reiniciarTemporizador = () => {
      if (tiempoInactividadRef.current) {
        clearTimeout(tiempoInactividadRef.current)
      }
      tiempoInactividadRef.current = setTimeout(() => {
        cerrarSesionSistema()
      }, tiempoLimite)
    }

    // Eventos del navegador que resetean el tiempo si el usuario interactúa
    const eventosActividad = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click'
    ]
    
    eventosActividad.forEach(evento => {
      document.addEventListener(evento, reiniciarTemporizador)
    })

    // Inicia el temporizador en cuanto se monta el componente
    reiniciarTemporizador()

    // ==========================================
    // 2. CONTROL AL CERRAR PESTAÑA O NAVEGADOR
    // ==========================================
    const manejarCierrePestana = () => {
      supabase.auth.signOut()
      localStorage.clear()
    }

    window.addEventListener('beforeunload', manejarCierrePestana)

    // Limpieza de eventos al desmontar (para evitar fugas de memoria)
    return () => {
      if (tiempoInactividadRef.current) clearTimeout(tiempoInactividadRef.current)
      
      eventosActividad.forEach(evento => {
        document.removeEventListener(evento, reiniciarTemporizador)
      })
      
      window.removeEventListener('beforeunload', manejarCierrePestana)
    }
  }, [tiempoLimite])
}