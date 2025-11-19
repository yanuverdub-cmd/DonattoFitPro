
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { User } from '../types';
import { Trash2, Shield, Users, Download, Activity, BarChart2, Calendar } from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export const AdminView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
      setUsers(dbService.getUsers());
      setStats(dbService.getDashboardStats());
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
        dbService.deleteUser(id);
        refreshData();
    }
  };

  const handleDownloadDB = () => {
      const data = dbService.getFullBackup();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donatto_analytics_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const COLORS = ['#000000', '#9CA3AF'];

  return (
    <div className="space-y-8 pb-20">
       <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
                <div className="bg-black text-white p-3 rounded-xl">
                    <Activity size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Dashboard</h2>
                    <p className="text-xs text-gray-500 font-bold">Analítica & Usuarios</p>
                </div>
            </div>
            <button 
                onClick={handleDownloadDB}
                className="bg-gray-100 text-black p-3 rounded-full hover:bg-black hover:text-white transition-colors"
                title="Exportar Base de Datos"
            >
                <Download size={20} />
            </button>
       </div>

       {stats && (
           <>
               {/* KPI Cards */}
               <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <p className="text-3xl font-black">{stats.totalUsers}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Usuarios</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <p className="text-3xl font-black">{stats.totalLogs}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Registros</p>
                    </div>
                    <div className="bg-black text-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <p className="text-3xl font-black">{stats.activeUsersToday}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Activos Hoy</p>
                    </div>
               </div>

               {/* Charts Section */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Activity Chart */}
                   <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                       <h3 className="text-sm font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                           <BarChart2 size={16} /> Actividad (7 días)
                       </h3>
                       <div className="h-48 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={stats.activityChart}>
                                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                   <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', fontSize: '12px'}} />
                                   <Bar dataKey="logs" fill="#000000" radius={[4, 4, 0, 0]} barSize={20} />
                               </BarChart>
                           </ResponsiveContainer>
                       </div>
                   </div>

                   {/* Distribution Chart */}
                   <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                       <h3 className="text-sm font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                           <Calendar size={16} /> Preferencias
                       </h3>
                       <div className="h-48 w-full flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.distributionChart}
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.distributionChart.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs font-bold">Tipos</span>
                            </div>
                       </div>
                       <div className="flex justify-center gap-4 mt-2">
                           <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                               <span className="w-2 h-2 bg-black rounded-full"></span> Pesas
                           </div>
                           <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                               <span className="w-2 h-2 bg-gray-400 rounded-full"></span> Cardio
                           </div>
                       </div>
                   </div>
               </div>
           </>
       )}

       {/* Users List Table */}
       <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mt-6">
          <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex justify-between items-center">
             <h3 className="text-xs font-black uppercase text-gray-500">Base de Datos de Usuarios</h3>
             <span className="text-[10px] font-bold bg-gray-200 px-2 py-1 rounded-md">{users.length} Total</span>
          </div>
          <div className="divide-y divide-gray-100">
             {users.map(user => (
                 <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt={user.firstName} />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                                        {user.firstName.charAt(0)}
                                    </div>
                                )}
                                {user.isAdmin && <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-[8px] font-black px-1 rounded border border-white">ADM</div>}
                            </div>
                            
                            <div>
                                <p className="font-bold text-sm text-gray-900">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="text-right">
                             {user.lastLogin ? (
                                 <p className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                     Activo: {new Date(user.lastLogin).toLocaleDateString()}
                                 </p>
                             ) : (
                                 <p className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Inactivo</p>
                             )}
                        </div>
                    </div>

                    <div className="flex justify-end mt-3 gap-2">
                         {!user.isAdmin && (
                            <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors flex items-center gap-1"
                            >
                                <Trash2 size={12} /> Eliminar Datos
                            </button>
                         )}
                    </div>
                 </div>
             ))}
          </div>
       </div>
    </div>
  );
};
