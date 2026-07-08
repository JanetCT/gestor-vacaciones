import { User, ShieldCheck, Code, Settings } from 'lucide-react'

// Definimos los tipos para los roles permitidos
type AllowedRoles = 'Desarrollador' | 'Administrador' | 'Usuario'

interface RoleDetail {
  label: string
  badgeClass: string
  icon: React.ReactNode
}

// Configuración de estilos según el rol de la base de datos
const ROL_CONFIG: Record<AllowedRoles, RoleDetail> = {
  Desarrollador: {
    label: 'Desarrollador',
    badgeClass: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    icon: <Code size={14} className="text-indigo-500" />
  },
  Administrador: {
    label: 'Administrador',
    badgeClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: <ShieldCheck size={14} className="text-emerald-500" />
  },
  Usuario: {
    label: 'Usuario',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: <User size={14} className="text-slate-500" />
  }
}

interface UserStatusCardProps {
  name: string
  role: string
}

export default function UserStatusCard({ name, role }: UserStatusCardProps) {
  // Aseguramos que si el rol viene vacío o no coincide, use 'Usuario' por defecto
  const validRole = (ROL_CONFIG[role as AllowedRoles] ? role : 'Usuario') as AllowedRoles
  const config = ROL_CONFIG[validRole]

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-xs select-none">
      {/* Icono de Perfil Izquierdo */}
      <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
        <User size={20} className="stroke-[2.5]" />
      </div>

      {/* Textos Informativos */}
      <div className="flex flex-col min-w-0">
        <h3 className="text-xs font-bold text-slate-800 tracking-wide truncate">
          {name || "Usuario Anónimo"}
        </h3>
        
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-medium text-slate-400">Rol:</span>
          <div className={`flex items-center gap-1 px-1.5 py-0.5 border rounded-md text-[9px] font-black tracking-wider uppercase ${config.badgeClass}`}>
            {config.icon}
            {config.label}
          </div>
        </div>
      </div>
    </div>
  )
}