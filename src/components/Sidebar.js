'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Warehouse, Users, ShoppingCart, BarChart3, RefreshCw, Truck, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Inventory', href: '/inventory', icon: Warehouse },
  { name: 'Inventory Transactions', href: '/inventory/transactions', icon: RefreshCw },
  { name: 'Suppliers', href: '/suppliers', icon: Truck },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900
         dark:text-white">zeno's</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Inventory System</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <span className="text-sm capitalize">{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
        </button>
      </div>
    </div>
  );
}