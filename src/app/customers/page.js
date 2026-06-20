'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (data) setCustomers(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingCustomer) {
      await supabase.from('customers').update(formData).eq('id', editingCustomer.id);
    } else {
      await supabase.from('customers').insert([formData]);
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
    fetchCustomers();
  }

  async function handleDelete(id) {
    if (confirm('Are you sure you want to delete this customer?')) {
      await supabase.from('customers').delete().eq('id', id);
      fetchCustomers();
    }
  }

  function handleEdit(customer) {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Customer
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Phone</th>
                <th className="text-left p-2">Address</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b">
                  <td className="p-2">{customer.name}</td>
                  <td className="p-2">{customer.email}</td>
                  <td className="p-2">{customer.phone}</td>
                  <td className="p-2">{customer.address}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => handleEdit(customer)} className="text-blue-600 hover:text-blue-800">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}