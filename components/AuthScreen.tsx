
import React, { useState } from 'react';
import { User } from '../types';
import { dbService } from '../services/dbService';
import { LogoCircular } from './Layout'; 
import { ArrowRight, Mail, User as UserIcon, Calendar } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    age: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailLower = formData.email.toLowerCase();

    if (isLogin) {
      const user = dbService.loginUser(emailLower);
      if (user) {
        onLogin(user);
      } else {
        // Admin Backdoor for instant login if not exists (Hidden from UI now)
        if (emailLower === 'admin@donatto.com') {
             const adminUser: User = {
                id: 'admin_master',
                firstName: 'Donatto',
                lastName: 'Admin',
                email: 'admin@donatto.com',
                age: 99,
                createdAt: Date.now(),
                isAdmin: true
             };
             dbService.createUser(adminUser);
             dbService.loginUser(adminUser.email);
             onLogin(adminUser);
             return;
        }
        setError('Usuario no encontrado. Revisa tu email o regístrate.');
      }
    } else {
      if (!formData.email || !formData.firstName || !formData.lastName || !formData.age) {
        setError('Completa todos los campos para continuar.');
        return;
      }

      const existingUser = dbService.loginUser(emailLower);
      if (existingUser) {
        setError('Este email ya está registrado.');
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: emailLower,
        age: parseInt(formData.age),
        createdAt: Date.now(),
        isAdmin: emailLower === 'admin@donatto.com' // Auto-grant admin
      };

      dbService.createUser(newUser);
      const loggedIn = dbService.loginUser(newUser.email);
      if (loggedIn) onLogin(loggedIn);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    const suffix = provider === 'google' ? 'gmail.com' : 'facebook.com';
    // Simulate a unique email based on timestamp to avoid conflicts in demo
    const mockEmail = `demo_${provider}_${Date.now()}@${suffix}`;
    
    const newUser: User = {
        id: Date.now().toString(),
        firstName: 'Atleta', // Default name for social login simulation
        lastName: provider === 'google' ? 'Google' : 'Facebook',
        email: mockEmail,
        age: 25,
        createdAt: Date.now()
    };
    dbService.createUser(newUser);
    const user = dbService.loginUser(mockEmail);

    if (user) {
        onLogin(user);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-12 animate-fade-in">
      <div className="w-full max-w-sm">
        
        {/* Header Brand */}
        <div className="flex flex-col items-center mb-10">
           <LogoCircular className="w-28 h-28 mb-6" />
           <h1 className="text-3xl font-black tracking-tighter text-black text-center uppercase">
             Donatto FitPro
           </h1>
           <p className="text-gray-500 font-medium text-sm mt-2 tracking-wide text-center uppercase">
             Tu evolución empieza aquí
           </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4 animate-slide-up">
                <div className="relative">
                  <UserIcon className="absolute top-3 left-3 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    placeholder="Nombre"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all capitalize"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <UserIcon className="absolute top-3 left-3 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    placeholder="Apellido"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all capitalize"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
            </div>
          )}

          {!isLogin && (
             <div className="relative animate-slide-up">
                <Calendar className="absolute top-3 left-3 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  required
                  placeholder="Edad"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute top-3 left-3 text-gray-400 w-4 h-4" />
            <input
              type="email"
              required
              placeholder="Email"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-4 bg-black text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-800 hover:scale-[1.02] transition-all shadow-lg"
          >
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Social Divider */}
        <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-xs font-bold text-gray-400 uppercase tracking-widest">O accede con</span>
            </div>
        </div>

        {/* Social Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4">
            <button 
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="currentColor"/></svg>
                <span className="ml-2 text-sm font-bold text-gray-600">Google</span>
            </button>
            <button 
                onClick={() => handleSocialLogin('facebook')}
                className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
                <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span className="ml-2 text-sm font-bold text-gray-600">Facebook</span>
            </button>
        </div>

        <div className="mt-8 text-center">
            <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
            >
                {isLogin ? (
                    <>¿Nuevo aquí? <span className="text-black font-bold underline">Crea tu cuenta gratis</span></>
                ) : (
                    <>¿Ya tienes cuenta? <span className="text-black font-bold underline">Inicia sesión</span></>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};
