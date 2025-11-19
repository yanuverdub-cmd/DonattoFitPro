
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { ProgressView } from './components/ProgressView';
import { TipsView } from './components/TipsView';
import { MerchView } from './components/MerchView';
import { ProfileView } from './components/ProfileView';
import { NutritionView } from './components/NutritionView';
import { AdminView } from './components/AdminView';
import { dbService } from './services/dbService';
import { User } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const user = dbService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    dbService.logout();
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const renderView = () => {
    if (!currentUser) return null;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={currentUser} onChangeView={setCurrentView} />;
      case 'progress':
        return <ProgressView user={currentUser} />;
      case 'nutrition':
        return <NutritionView />;
      case 'tips':
        return <TipsView />;
      case 'merch':
        return <MerchView />;
      case 'profile':
        return <ProfileView user={currentUser} onUpdateUser={setCurrentUser} onLogout={handleLogout} />;
      case 'admin':
        return currentUser.isAdmin ? <AdminView /> : <Dashboard user={currentUser} onChangeView={setCurrentView} />;
      default:
        return <Dashboard user={currentUser} onChangeView={setCurrentView} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <Layout
      currentView={currentView}
      onChangeView={setCurrentView}
      onLogout={handleLogout}
      userInitial={currentUser.firstName.charAt(0).toUpperCase()}
      userProfilePic={currentUser.profilePicture}
      isAdmin={currentUser.isAdmin}
    >
      {renderView()}
    </Layout>
  );
}
