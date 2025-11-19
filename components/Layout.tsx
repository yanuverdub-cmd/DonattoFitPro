
import React from 'react';
import { TrendingUp, User, ShoppingBag, Zap, LogOut, Home, Menu, Utensils, Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void;
  userInitial: string;
  userProfilePic?: string;
  isAdmin?: boolean;
}

// --- BRAND ASSETS (SVGs) ---

// Logo 1: Horizontal "DF + Barbell" for Header
const LogoHorizontal = () => (
  <div className="flex items-center gap-3">
     <div className="relative flex items-center justify-center w-10 h-10 bg-black rounded-lg">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           {/* DF Text */}
           <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fill="white" fontFamily="sans-serif" fontWeight="900" fontSize="14">DF</text>
           {/* Barbell Line passing through */}
           <rect x="0" y="11" width="24" height="2" fill="white" fillOpacity="0.3"/>
        </svg>
     </div>
     <div className="flex flex-col justify-center h-10">
        <span className="font-black text-lg leading-none tracking-tighter text-black">DONATTO</span>
        <span className="font-bold text-[10px] leading-none tracking-[0.3em] text-gray-500 mt-1">FITPRO</span>
     </div>
  </div>
);

// Logo 2: Circular with Dumbbell (Used in specific branding spots if needed, or simplified for icons)
export const LogoCircular = ({ className = "w-24 h-24" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" stroke="black" strokeWidth="4" fill="white"/>
        <path d="M20 35 H30 V65 H20 Z" fill="black"/>
        <path d="M70 35 H80 V65 H70 Z" fill="black"/>
        <rect x="15" y="48" width="70" height="4" fill="black"/>
        <text x="50" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill="black" letterSpacing="0.1em">FITPRO</text>
        <text x="50" y="56" textAnchor="middle" fontSize="24" fontWeight="900" fill="black">DF</text>
        <path d="M25 25 A 40 40 0 0 1 75 25" stroke="black" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
    </svg>
);

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, onLogout, userInitial, userProfilePic, isAdmin }) => {
  
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'progress', label: 'Progreso', icon: TrendingUp },
    { id: 'nutrition', label: 'Alimentación', icon: Utensils },
    { id: 'tips', label: 'Consejos', icon: Zap },
    { id: 'merch', label: 'Tienda', icon: ShoppingBag },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  // Add Admin Tab if user is admin
  if (isAdmin) {
      navItems.push({ id: 'admin', label: 'Gestión', icon: Shield });
  }

  const ProfileAvatar = ({ size = "small" }: { size?: "small" | "large" }) => {
    const sizeClasses = size === "small" ? "w-9 h-9" : "w-12 h-12";
    
    if (userProfilePic) {
        return (
            <img 
                src={userProfilePic} 
                alt="Profile" 
                className={`${sizeClasses} rounded-full object-cover border-2 border-black`}
            />
        );
    }
    return (
        <div className={`${sizeClasses} rounded-full bg-black flex items-center justify-center text-xs font-bold text-white border-2 border-gray-200`}>
            {userInitial}
        </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans selection:bg-black selection:text-white">
      
      {/* TOP HEADER (Sticky) */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm pt-safe">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="cursor-pointer active:opacity-70 transition-opacity" onClick={() => onChangeView('dashboard')}>
              <LogoHorizontal />
            </div>

            <div className="flex items-center gap-4">
               <div onClick={() => onChangeView('profile')} className="cursor-pointer hover:opacity-80 transition-opacity">
                   <ProfileAvatar />
               </div>
               {/* Desktop Logout (Hidden on mobile to save space) */}
               <button onClick={onLogout} className="hidden md:block text-gray-400 hover:text-red-600 transition-colors">
                   <LogOut className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow w-full max-w-lg mx-auto px-4 py-6 pb-28 animate-fade-in">
        {children}
      </main>

      {/* BOTTOM NAVIGATION (Mobile First) */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
         <div className="max-w-lg mx-auto">
            <div className="flex justify-around items-center h-16 px-2 overflow-x-auto no-scrollbar">
               {navItems.map((item) => {
                 const Icon = item.icon;
                 const isActive = currentView === item.id;
                 
                 return (
                   <button
                     key={item.id}
                     onClick={() => onChangeView(item.id)}
                     className={`flex flex-col items-center justify-center min-w-[60px] w-full h-full transition-all duration-200 group relative ${isActive ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                   >
                      {isActive && (
                        <div className="absolute top-0 w-8 h-1 bg-black rounded-b-md" />
                      )}
                      <Icon 
                        size={20} 
                        strokeWidth={isActive ? 2.5 : 2} 
                        className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-active:scale-95'}`}
                      />
                      <span className={`text-[8px] font-bold uppercase tracking-wider mt-1 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                        {item.label}
                      </span>
                   </button>
                 );
               })}
            </div>
         </div>
      </nav>
    </div>
  );
};
