'use client';
import { Bell, User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-white dark:bg-gray-900 red:bg-red-900 border-b border-gray-200 dark:border-gray-700 red:border-red-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white red:text-red-100">Good morning, Admin</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 red:hover:bg-red-800 rounded-full transition-colors">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400 red:text-red-200" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 red:hover:bg-red-800 rounded-full transition-colors">
            <User className="h-5 w-5 text-gray-600 dark:text-gray-400 red:text-red-200" />
          </button>
        </div>
      </div>
    </header>
  );
}