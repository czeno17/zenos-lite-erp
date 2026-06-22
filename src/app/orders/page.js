'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { formatPHP } from '../../lib/utils';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, []);

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, customers(name)')
      .order('order_date', { ascending: false });
    if (data) setOrders(data);
  }

  async function fetchCustomers() {
    const { data } = await supabase.from('customers').select('id, name');
    if (data) setCustomers(data);
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  }

  async function addToCart(product) {
    const existingItem = cart.find(item => item.product_id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1, total_price: (item.quantity + 1) * item.unit_price }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price,
        total_price: product.price
      }]);
    }
  }

  function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.product_id !== productId));
    } else {
      setCart(cart.map(item =>
        item.product_id === productId
          ? { ...item, quantity: newQuantity, total_price: newQuantity * item.unit_price }
          : item
      ));
    }
  }

  function removeFromCart(productId) {
    setCart(cart.filter(item => item.product_id !== productId));
  }

  async function submitOrder() {
    if (!selectedCustomer || cart.length === 0) {
      alert('Please select a customer and add items');
      return;
    }
    const totalAmount = cart.reduce((sum, item) => sum + item.total_price, 0);
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ customer_id: selectedCustomer, total_amount: totalAmount, status: 'pending' }])
      .select()
      .single();
    if (orderError) { console.error(orderError); return; }
    const orderItems = cart.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }));
    await supabase.from('order_items').insert(orderItems);
    for (const item of cart) {
      const product = products.find(p => p.id === item.product_id);
      const newStock = product.stock_quantity - item.quantity;
      await supabase.from('products').update({ stock_quantity: newStock }).eq('id', item.product_id);
      await supabase.from('stock_movements').insert([{
        product_id: item.product_id,
        movement_type: 'OUT',
        quantity: item.quantity,
        reason: 'Sale'
      }]);
    }
    setIsModalOpen(false);
    setSelectedCustomer('');
    setCart([]);
    fetchOrders();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button onClick={() => setIsModalOpen(true)}>Create Order</Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Order ID</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Total</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b">
                    <td className="p-2">{order.id.slice(0,8)}...</td>
                    <td className="p-2">{order.customers?.name}</td>
                    <td className="p-2">{new Date(order.order_date).toLocaleDateString()}</td>
                    <td className="p-2">{formatPHP(order.total_amount)}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Order</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Products</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {products.map(product => (
                    <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-600">{formatPHP(product.price)} | Stock: {product.stock_quantity}</div>
                      </div>
                      <Button size="sm" onClick={() => addToCart(product)} disabled={product.stock_quantity === 0}>
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Customer</label>
                  <Select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </Select>
                </div>
                <h3 className="font-semibold mb-2">Cart</h3>
                {cart.length === 0 ? (
                  <p className="text-gray-500">No items added</p>
                ) : (
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.product_id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm">
                            {formatPHP(item.unit_price)} x {item.quantity} = {formatPHP(item.total_price)}
                          </div>
                        </div>
                        <div className="space-x-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 0)}
                            className="w-16 p-1 border rounded"
                          />
                          <button onClick={() => removeFromCart(item.product_id)} className="text-red-600">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="font-bold">Total: {formatPHP(cart.reduce((sum, item) => sum + item.total_price, 0))}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={submitOrder}>Place Order</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}