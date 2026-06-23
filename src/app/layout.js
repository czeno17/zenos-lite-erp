'use client';

import './globals.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import ProtectedLayout from '../components/ProtectedLayout';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {isAuthPage ? (
              children
            ) : (
              <ProtectedLayout>
                <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar />
                    <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
                      {children}
                    </main>
                  </div>
                </div>
              </ProtectedLayout>
            )}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}