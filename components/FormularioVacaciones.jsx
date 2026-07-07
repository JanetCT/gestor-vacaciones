'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function FormularioVacaciones({ onVacacionCreada }) {
  const [colaboradores, setColaboradores] = useState([])
  const [usuarioId, setUsuarioId] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  useEffect(() => {
    async function cargarColaboradores() {
      const { data } = await supabase.from('perfiles').select('id, nombre')
      if (data) setColaboradores(data)
    }
    cargarColaboradores()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('vacaciones').insert([
      { usuario_id: usuarioId, fecha_inicio: fechaInicio, fecha_fin: fechaFin }
    ])

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('Novedad registrada correctamente')
      onVacacionCreada()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-bold mb-4">Registrar Novedad</h2>
      <select 
        className="w-full p-2 border rounded mb-4" 
        onChange={(e) => setUsuarioId(e.target.value)} 
        required
      >
        <option value="">Seleccionar colaborador</option>
        {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
      </select>
      <input type="date" className="w-full p-2 border rounded mb-2" onChange={(e) => setFechaInicio(e.target.value)} required />
      <input type="date" className="w-full p-2 border rounded mb-4" onChange={(e) => setFechaFin(e.target.value)} required />
      <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Registrar</button>
    </form>
  )
}