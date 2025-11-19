
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { dbService } from '../services/dbService';
import { Save, Camera, Target, Scale, Calendar, Trophy, Download, Upload, HardDrive } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser }) => {
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
      if (file.size > 2 * 1024 * 1024) {
         setMessage('La imagen es demasiado grande. Máx 2MB.');
         setTimeout(() => setMessage(''), 3000);
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
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

    dbService.updateUser(updatedUser);
    onUpdateUser(updatedUser);
    setMessage('Perfil actualizado correctamente.');
    setTimeout(() => setMessage(''), 3000);
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
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="h-24 bg-black relative">
            <div className="absolute right-0 top-0 w-24 h-24 bg-gray-800 rounded-bl-full opacity-50"></div>
        </div>
        <div className="px-6 pb-6 relative">
            <div className="absolute -top-12 left-6">
                <div 
                  className="relative group cursor-pointer"
                  onClick={triggerFileInput}
                  title="Cambiar foto de perfil"
                >
                    <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md overflow-hidden relative">
                        <img 
                            src={profilePic || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=000000&color=fff`} 
                            alt="Profile" 
                            className="h-full w-full rounded-full object-cover hover:opacity-90 transition-opacity" 
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                           <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerFileInput();
                        }}
                        className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full shadow hover:bg-gray-800 transition-colors z-10"
                    >
                        <Camera size={14} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                </div>
            </div>
            <div className="mt-14">
                <h2 className="text-2xl font-black text-gray-900">{user.firstName} {user.lastName}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase font-bold">Días Activos</p>
                    <p className="font-black text-xl">{user.activeDaysCount || 1}</p>
                </div>
                <div className="text-center border-l border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold">Edad</p>
                    <p className="font-black text-xl">{user.age}</p>
                </div>
                <div className="text-center border-l border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold">Nivel</p>
                    <p className="font-black text-xl">PRO</p>
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
            <div className="mb-4 p-3 bg-black text-white text-sm font-bold rounded text-center animate-fade-in">
                {message}
            </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                    <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border-b-2 border-gray-200 focus:border-black py-2 outline-none bg-transparent font-medium" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Apellido</label>
                    <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border-b-2 border-gray-200 focus:border-black py-2 outline-none bg-transparent font-medium" />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Scale size={12}/> Peso Actual (kg)</label>
                <input type="text" name="currentWeight" value={formData.currentWeight} onChange={handleChange} placeholder="Ej: 75.5" className="w-full border-b-2 border-gray-200 focus:border-black py-2 outline-none bg-transparent font-medium" />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Trophy size={12}/> Objetivo Principal</label>
                <select name="mainObjective" value={formData.mainObjective} onChange={handleChange} className="w-full border-b-2 border-gray-200 focus:border-black py-2 outline-none bg-transparent font-medium">
                    <option value="">Seleccionar...</option>
                    <option value="Hipertrofia">Ganar Músculo (Hipertrofia)</option>
                    <option value="Definición">Perder Grasa (Definición)</option>
                    <option value="Fuerza">Ganar Fuerza</option>
                    <option value="Resistencia">Resistencia / Cardio</option>
                    <option value="Salud">Salud General</option>
                </select>
            </div>

             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta Específica</label>
                <input type="text" name="targetGoal" value={formData.targetGoal} onChange={handleChange} placeholder="Ej: Bajar 5kg para verano" className="w-full border-b-2 border-gray-200 focus:border-black py-2 outline-none bg-transparent font-medium" />
            </div>

            <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-900 transition-colors mt-4 flex justify-center items-center active:scale-[0.99]">
                <Save size={18} className="mr-2" /> GUARDAR PERFIL
            </button>
        </form>
      </div>

      {/* Data Management Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
             <HardDrive className="mr-2" size={20} /> Gestión de Datos
          </h3>
          <p className="text-xs text-gray-500 mb-4">
             Tus datos se guardan en este dispositivo. Haz una copia de seguridad para transferirlos.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleDownloadBackup}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-black transition-colors"
              >
                 <Download size={24} />
                 <span className="text-xs font-black uppercase">Exportar Copia</span>
              </button>

              <button 
                onClick={() => restoreInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-black transition-colors"
              >
                 <Upload size={24} />
                 <span className="text-xs font-black uppercase">Importar Datos</span>
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
    </div>
  );
};
