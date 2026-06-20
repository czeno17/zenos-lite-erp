'use client';
import { formatPHP } from '../../lib/utils';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    price: '',
    stock_quantity: '',
    supplier: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingProduct) {
      await supabase.from('products').update(formData).eq('id', editingProduct.id);
    } else {
      await supabase.from('products').insert([formData]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ sku: '', name: '', description: '', category: '', price: '', stock_quantity: '', supplier: '' });
    fetchProducts();
  }

  async function handleDelete(id) {
    if (confirm('Are you sure you want to delete this product?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  }

  function handleEdit(product) {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      price: product.price,
      stock_quantity: product.stock_quantity,
      supplier: product.supplier || '',
    });
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">SKU</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Category</th>
                <th className="text-left p-2">Price</th>
                <th className="text-left p-2">Stock</th>
                <th className="text-left p-2">Supplier</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="p-2">{product.sku}</td>
                  <td className="p-2">{product.name}</td>
                  <td className="p-2">{product.category}</td>
                  <td className="p-2">{formatPHP(product.price)}</td>
                  <td className={`p-2 ${product.stock_quantity < 10 ? 'text-red-600 font-bold' : ''}`}>
                    {product.stock_quantity}
                  </td>
                  <td className="p-2">{product.supplier}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800">
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
            <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="SKU"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
              <Input
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <Input
                type="number"
                placeholder="Stock Quantity"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                required
              />
              <Input
                placeholder="Supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
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