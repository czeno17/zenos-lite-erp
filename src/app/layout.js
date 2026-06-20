import './globals.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ThemeProvider } from '../context/ThemeContext';

export const metadata = {
  title: 'Lite ERP System',
  description: 'Modern inventory and order management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-gray-900 red:bg-red-900">
        <ThemeProvider>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Navbar />
              <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800 red:bg-red-800">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}