'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Edit2, Check, X } from 'lucide-react';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movementType, setMovementType] = useState('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReorder, setEditingReorder] = useState(null);
  const [tempReorderValue, setTempReorderValue] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('name');
    if (data) setProducts(data);
  }

  async function handleStockMovement(e) {
    e.preventDefault();
    const product = selectedProduct;
    const newStock = movementType === 'IN' 
      ? product.stock_quantity + parseInt(quantity)
      : product.stock_quantity - parseInt(quantity);
    
    if (newStock < 0) {
      alert('Stock cannot be negative');
      return;
    }

    await supabase.from('products').update({ stock_quantity: newStock }).eq('id', product.id);
    await supabase.from('stock_movements').insert([{
      product_id: product.id,
      movement_type: movementType,
      quantity: parseInt(quantity),
      reason: reason,
    }]);
    
    setIsModalOpen(false);
    setSelectedProduct(null);
    setQuantity('');
    setReason('');
    fetchProducts();
  }

  async function updateReorderLevel(productId, newLevel) {
    if (isNaN(newLevel) || newLevel < 0) {
      alert('Reorder point must be a positive number');
      return;
    }
    await supabase.from('products').update({ reorder_level: newLevel }).eq('id', productId);
    fetchProducts();
    setEditingReorder(null);
  }

  function getStockStatus(stock, reorderLevel) {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock <= reorderLevel) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  }

  const startEditReorder = (product) => {
    setEditingReorder(product.id);
    setTempReorderValue(product.reorder_level || 10);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Current Stock Levels</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Product Name</th>
                <th className="text-left p-2">SKU</th>
                <th className="text-left p-2">Current Stock</th>
                <th className="text-left p-2">Reorder Point</th>
                <th className="text-left p-2">Stock Status</th>
                <th className="text-left p-2">Actions</th>
               </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const reorderLevel = product.reorder_level || 10;
                const status = getStockStatus(product.stock_quantity, reorderLevel);
                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{product.name}</td>
                    <td className="p-2 text-gray-500">{product.sku}</td>
                    <td className="p-2 font-bold">{product.stock_quantity}</td>
                    <td className="p-2">
                      {editingReorder === product.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={tempReorderValue}
                            onChange={(e) => setTempReorderValue(e.target.value)}
                            className="w-20 h-8 text-sm"
                            autoFocus
                          />
                          <button
                            onClick={() => updateReorderLevel(product.id, parseInt(tempReorderValue))}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingReorder(null)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{reorderLevel}</span>
                          <button
                            onClick={() => startEditReorder(product)}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsModalOpen(true);
                        }}
                      >
                        Adjust Stock
                      </Button>
                    </td>
                   </tr>
                );
              })}
            </tbody>
           </table>
        </CardContent>
      </Card>

      {/* Stock Movement Modal (unchanged) */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Stock Adjustment: {selectedProduct.name}
            </h2>
            <form onSubmit={handleStockMovement} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Movement Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="IN"
                      checked={movementType === 'IN'}
                      onChange={(e) => setMovementType(e.target.value)}
                      className="mr-2"
                    />
                    Stock In
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="OUT"
                      checked={movementType === 'OUT'}
                      onChange={(e) => setMovementType(e.target.value)}
                      className="mr-2"
                    />
                    Stock Out
                  </label>
                </div>
              </div>
              <Input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <Input
                placeholder="Reason (e.g., Purchase, Sale, Return)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Process Movement</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}