
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { User } from '../types';
import { Trash2, Shield, Users, Download } from 'lucide-react';

export const AdminView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(dbService.getUsers());
  }, []);

  const handleDeleteUser = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
        dbService.deleteUser(id);
        setUsers(dbService.getUsers());
    }
  };

  const handleDownloadDB = () => {
      const data = dbService.getFullBackup();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donatto_full_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 pb-20">
       <div className="flex items-center gap-3 mb-6">
          <div className="bg-black text-white p-3 rounded-xl">
             <Shield size={24} />
          </div>
          <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Panel Admin</h2>
              <p className="text-xs text-gray-500 font-bold">Gestión de Usuarios & Datos</p>
          </div>
       </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <Users className="text-gray-400 mb-2" size={20} />
              <p className="text-2xl font-black">{users.length}</p>
              <p className="text-xs text-gray-500 uppercase font-bold">Usuarios Registrados</p>
          </div>
          <button 
            onClick={handleDownloadDB}
            className="bg-black text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between hover:bg-gray-800 transition-colors"
          >
              <Download className="text-white mb-2" size={20} />
              <div>
                <p className="text-sm font-black uppercase">Exportar DB</p>
                <p className="text-[10px] text-gray-400">Backup Completo</p>
              </div>
          </button>
       </div>

       {/* Users List */}
       <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
             <h3 className="text-xs font-black uppercase text-gray-500">Lista de Usuarios</h3>
          </div>
          <div className="divide-y divide-gray-100">
             {users.map(user => (
                 <div key={user.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                            {user.firstName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-sm">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                    </div>
                    
                    {!user.isAdmin && (
                        <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-400 hover:text-red-600 p-2"
                            title="Eliminar Usuario"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                    {user.isAdmin && (
                        <span className="text-[10px] bg-black text-white px-2 py-1 rounded font-bold">ADMIN</span>
                    )}
                 </div>
             ))}
          </div>
       </div>
    </div>
  );
};
