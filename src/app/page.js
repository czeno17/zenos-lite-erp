'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Package, AlertTriangle, ShoppingCart, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatPHP } from '../lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    openOrders: 0,
    mtdRevenue: 0,
  });
  const [reorderAlerts, setReorderAlerts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchAnalyticsData();
  }, []);

  async function fetchDashboardData() {
    const { data: products } = await supabase.from('products').select('*');
    const totalProducts = products?.length || 0;
    const lowStock = products?.filter(p => p.stock_quantity < (p.reorder_level || 10)) || [];
    const lowStockCount = lowStock.length;
    setReorderAlerts(lowStock.slice(0, 5));

    const { data: orders } = await supabase
      .from('orders')
      .select(`id, order_date, total_amount, status, customers (name)`)
      .order('order_date', { ascending: false });
    const openOrders = orders?.filter(o => o.status !== 'completed').length || 0;
    setRecentOrders(orders?.slice(0, 5) || []);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const mtdOrders = orders?.filter(o => o.order_date >= startOfMonth) || [];
    const mtdRevenue = mtdOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    setStats({
      totalProducts,
      lowStockCount,
      openOrders,
      mtdRevenue,
    });
  }

  async function fetchAnalyticsData() {
    // Monthly sales
    const { data: orders } = await supabase.from('orders').select('order_date, total_amount');
    if (orders) {
      const monthly = orders.reduce((acc, order) => {
        const month = new Date(order.order_date).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + order.total_amount;
        return acc;
      }, {});
      setSalesData(Object.entries(monthly).map(([month, amount]) => ({ month, amount })));
    }

    // Category distribution
    const { data: products } = await supabase.from('products').select('category');
    if (products) {
      const cats = products.reduce((acc, p) => {
        const cat = p.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});
      setCategoryData(Object.entries(cats).map(([name, value]) => ({ name, value })));
    }

    // Top products
    const { data: items } = await supabase.from('order_items').select('product_id, products(name), quantity');
    if (items) {
      const sales = items.reduce((acc, item) => {
        const name = item.products?.name || 'Unknown';
        acc[name] = (acc[name] || 0) + item.quantity;
        return acc;
      }, {});
      setTopProducts(Object.entries(sales).map(([name, quantity]) => ({ name, quantity })).sort((a,b) => b.quantity - a.quantity).slice(0,5));
    }
  }

  const statusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return `px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Good morning, Admin</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Live overview of your inventory & orders</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total SKUs</p>
              <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stats.totalProducts}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock Alerts</p>
              <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{stats.lowStockCount}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stats.lowStockCount} SKUs below threshold</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Open Orders</p>
              <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stats.openOrders}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">MTD Revenue</p>
              <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{formatPHP(stats.mtdRevenue)}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Sales orders only</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Two‑column: Reorder Alerts + Recent Orders */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Reorder Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h2 className="font-semibold text-gray-900 dark:text-white">Reorder Alerts</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {reorderAlerts.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">All stock levels are healthy</div>
            ) : (
              reorderAlerts.map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.sku}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 dark:text-gray-500">stock / threshold</span>
                      <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-200">
                        {product.stock_quantity} / {product.reorder_level || 10}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">Confirmed</span>
                    <p className="text-sm font-bold mt-2 text-gray-700 dark:text-gray-200">{formatPHP(product.price * product.stock_quantity)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">No orders yet</div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{order.id.slice(0, 12)}...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.customers?.name || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <span className={statusBadge(order.status)}>{order.status}</span>
                    <p className="text-sm font-bold mt-2 text-gray-700 dark:text-gray-200">{formatPHP(order.total_amount)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Monthly Sales</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Products by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent*100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top Selling Products</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis dataKey="name" type="category" width={150} stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} />
              <Bar dataKey="quantity" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}