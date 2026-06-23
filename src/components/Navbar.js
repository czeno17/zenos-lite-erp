'use client';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    console.log('Logout clicked');
    try {
      await signOut();
      console.log('Sign out successful');
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed, clearing storage manually:', err);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Good morning, {user?.email?.split('@')[0] || 'Admin'}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
}