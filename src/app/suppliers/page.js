'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    console.log('Fetching suppliers...');
    const { data, error } = await supabase.from('suppliers').select('*').order('name');
    if (error) {
      console.error('Fetch error:', error);
      alert('Error fetching suppliers: ' + error.message);
    } else {
      console.log('Fetched suppliers:', data);
      setSuppliers(data || []);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    console.log('Submitting form data:', formData);

    if (editingSupplier) {
      const { data, error } = await supabase
        .from('suppliers')
        .update(formData)
        .eq('id', editingSupplier.id)
        .select();
      if (error) {
        console.error('Update error:', error);
        alert('Update failed: ' + error.message);
      } else {
        console.log('Update success:', data);
      }
    } else {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([formData])
        .select();
      if (error) {
        console.error('Insert error:', error);
        alert('Insert failed: ' + error.message);
      } else {
        console.log('Insert success:', data);
      }
    }

    setLoading(false);
    setIsModalOpen(false);
    setEditingSupplier(null);
    setFormData({ name: '', contact_person: '', email: '', phone: '', address: '' });
    await fetchSuppliers(); // refresh list
  }

  async function handleDelete(id) {
    if (confirm('Are you sure you want to delete this supplier?')) {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) {
        alert('Delete failed: ' + error.message);
      } else {
        fetchSuppliers();
      }
    }
  }

  function handleEdit(supplier) {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
    });
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <Button onClick={() => setIsModalOpen(true)} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" /> Add Supplier
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Contact Person</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2">Address</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{supplier.name}</td>
                    <td className="p-2">{supplier.contact_person || '—'}</td>
                    <td className="p-2">{supplier.email || '—'}</td>
                    <td className="p-2">{supplier.phone || '—'}</td>
                    <td className="p-2">{supplier.address || '—'}</td>
                    <td className="p-2 space-x-2">
                      <button onClick={() => handleEdit(supplier)} className="text-blue-600 hover:text-blue-800">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(supplier.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No suppliers yet. Click "Add Supplier" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Supplier Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="Contact Person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
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
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}