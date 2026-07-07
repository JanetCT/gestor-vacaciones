'use client'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { motion } from 'framer-motion'

export default function Calendario({ eventos, onEventClick }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm w-full mx-auto max-w-5xl"
    >
      {/* Contenedor personalizado para forzar nuestros estilos premium */}
      <div className="custom-calendar-wrapper text-sm">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={eventos}
          locale="es"
          headerToolbar={{
            left: 'title',
            center: '',
            right: 'prev,next today'
          }}
          buttonText={{
            today: 'Hoy'
          }}
          eventClick={(info) => onEventClick(info.event)}
          dayMaxEvents={2} // Limita eventos visibles por celda para que no se desborde, añade un "+ más" compacto
          height="auto"
        />
      </div>
    </motion.div>
  )
}