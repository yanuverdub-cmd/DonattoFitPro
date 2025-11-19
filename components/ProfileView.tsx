
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { dbService } from '../services/dbService';
import { Save, Camera, Target, Scale, Trophy, Download, Upload, HardDrive, X, CheckCircle, LogOut, User as UserIcon, Mail } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser, onLogout }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    age: user.age.toString(),
    currentWeight: user.currentWeight || '',
    mainObjective: user.mainObjective || '',
    targetGoal: user.targetGoal || ''
  });
  const [profilePic, setProfilePic] = useState<string | undefined>(user.profilePicture);
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit to 1MB to preserve LocalStorage
      if (file.size > 1 * 1024 * 1024) {
         setMessage('La imagen es muy pesada. Máx 1MB.');
         setTimeout(() => setMessage(''), 4000);
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
        // Visual feedback that save is needed
        if (!message) setMessage('¡Foto cargada! Recuerda guardar cambios.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedUser: User = {
      ...user,
      firstName: formData.firstName,
      lastName: formData.lastName,
      age: parseInt(formData.age) || user.age,
      currentWeight: formData.currentWeight,
      mainObjective: formData.mainObjective,
      targetGoal: formData.targetGoal,
      profilePicture: profilePic
    };

    const success = dbService.updateUser(updatedUser);
    
    if (success) {
        onUpdateUser(updatedUser);
        setMessage('Perfil actualizado correctamente.');
    } else {
        setMessage('Error: Memoria llena. Usa una foto más liviana.');
    }
    setTimeout(() => setMessage(''), 4000);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadBackup = () => {
      const data = dbService.getFullBackup();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donatto_backup_${user.firstName}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setMessage('Copia de seguridad descargada.');
      setTimeout(() => setMessage(''), 3000);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              const content = event.target?.result as string;
              if (confirm('ADVERTENCIA: Esto sobrescribirá todos los datos actuales. ¿Continuar?')) {
                  const success = dbService.restoreBackup(content);
                  if (success) {
                      alert('Datos restaurados con éxito. La página se recargará.');
                      window.location.reload();
                  } else {
                      alert('Error al restaurar el archivo. Formato inválido.');
                  }
              }
          };
          reader.readAsText(file);
      }
  };

  return (
    <div className="pb-20">
      {/* Identity Card Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-6 relative">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-50 to-white"></div>
        
        <div className="px-6 pt-8 pb-6 relative flex flex-col items-center text-center z-10">
            {/* Avatar */}
            <div className="relative group cursor-pointer mb-4" onClick={triggerFileInput}>
                <div className={`w-28 h-28 rounded-full p-1.5 shadow-lg ${message.includes('Recuerda') ? 'bg-yellow-400 animate-pulse' : 'bg-white'}`}>
                    <img 
                        src={profilePic || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=000000&color=fff`} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover border border-gray-100" 
                    />
                </div>
                <div className="absolute bottom-1 right-1 bg-black text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform">
                    <Camera size={14} />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            {/* User Info */}
            <h2 className="text-2xl font-black text-gray-900 capitalize tracking-tight">
                {user.firstName} {user.lastName}
            </h2>
            
            {/* Prominent Email Badge */}
            <div className="mt-2 flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-full">
                <Mail size={12} className="text-gray-500" />
                <span className="text-xs font-bold text-gray-600">{user.email}</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-8 mt-8 w-full border-t border-gray-100 pt-6">
                <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Días Activos</p>
                    <p className="font-black text-xl text-black mt-1">{user.activeDaysCount || 1}</p>
                </div>
                <div className="relative after:content-[''] after:absolute after:right-0 after:top-2 after:h-8 after:w-[1px] after:bg-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Edad</p>
                    <p className="font-black text-xl text-black mt-1">{user.age}</p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Nivel</p>
                    <p className="font-black text-xl text-black mt-1">{user.isAdmin ? 'ADMIN' : 'PRO'}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-bold mb-4 flex items-center">
            <Target className="mr-2" size={20} /> Objetivos & Datos
        </h3>
        
        {message && (
            <div className={`mb-6 p-4 rounded-xl shadow-lg animate-fade-in flex items-center justify-between ${message.includes('Error') || message.includes('pesada') ? 'bg-red-500 text-white' : 'bg-black text-white'}`}>
                <div className="flex items-center gap-3">
                    {message.includes('Error') || message.includes('pesada') ? (
                        <X size={20} className="text-white" />
                    ) : (
                        <CheckCircle size={20} className="text-green-400" />
                    )}
                    <span className="text-xs font-bold">{message}</span>
                </div>
                <button onClick={() => setMessage('')} className="text-white/70 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre</label>
                    <UserIcon size={14} className="absolute bottom-3 left-0 text-gray-300" />
                    <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border-b-2 border-gray-200 focus:border-black py-2 pl-6 outline-none bg-transparent font-bold text-sm capitalize transition-colors" />
                </div>
                <div className="relative">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Apellido</label>
                    <UserIcon size={14} className="absolute bottom-3 left-0 text-gray-300" />
                    <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border-b-2 border-gray-200 focus:border-black py-2 pl-6 outline-none bg-transparent font-bold text-sm capitalize transition-colors" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Scale size={12}/> Peso (kg)</label>
                    <input type="text" name="currentWeight" value={formData.currentWeight} onChange={handleChange} placeholder="Ej: 75.5" className="w-full border-b-2 border-gray-200 focus:border-black py-2 outline-none bg-transparent font-bold text-sm" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Trophy size={12}/> Objetivo</label>
                    <select name="mainObjective" value={formData.mainObjective} onChange={handleChange} className="w-full border-b-2 border-gray-200 focus:border-black py-2 outline-none bg-transparent font-bold text-sm">
                        <option value="">Seleccionar...</option>
                        <option value="Hipertrofia">Ganar Músculo</option>
                        <option value="Definición">Perder Grasa</option>
                        <option value="Fuerza">Fuerza Pura</option>
                        <option value="Resistencia">Resistencia</option>
                        <option value="Salud">Salud General</option>
                    </select>
                </div>
            </div>

             <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Meta Personal</label>
                <input type="text" name="targetGoal" value={formData.targetGoal} onChange={handleChange} placeholder="Ej: Bajar 5kg para verano" className="w-full border-b-2 border-gray-200 focus:border-black py-2 outline-none bg-transparent font-bold text-sm" />
            </div>

            <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition-all mt-4 flex justify-center items-center shadow-lg active:scale-[0.99] uppercase tracking-widest text-xs">
                <Save size={16} className="mr-2" /> Guardar Cambios
            </button>
        </form>
      </div>

      {/* Data Management Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-black uppercase tracking-tight mb-4 flex items-center gap-2">
             <HardDrive size={16} /> Gestión de Datos
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleDownloadBackup}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-black hover:bg-white transition-all group"
              >
                 <Download size={20} className="text-gray-400 group-hover:text-black" />
                 <span className="text-[10px] font-black uppercase">Descargar Copia</span>
              </button>

              <button 
                onClick={() => restoreInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-black hover:bg-white transition-all group"
              >
                 <Upload size={20} className="text-gray-400 group-hover:text-black" />
                 <span className="text-[10px] font-black uppercase">Importar Datos</span>
              </button>
              <input 
                 type="file" 
                 ref={restoreInputRef} 
                 className="hidden" 
                 accept=".json" 
                 onChange={handleRestoreBackup} 
              />
          </div>
      </div>

      {/* Logout Button */}
      <button 
        onClick={onLogout}
        className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest text-xs mb-6"
      >
          <LogOut size={16} /> Cerrar Sesión
      </button>
    </div>
  );
};
