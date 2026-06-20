'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function InventoryTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    const { data, error } = await supabase
      .from('stock_movements')
      .select(`
        *,
        products (name, sku)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }

  async function reverseTransaction(txn) {
    if (!confirm(`Reverse transaction #${txn.id.slice(0,8)}? This will create a compensating stock movement.`)) return;

    const oppositeType = txn.movement_type === 'IN' ? 'OUT' : 
                         txn.movement_type === 'OUT' ? 'IN' : 'ADJ';
    const reverseQuantity = txn.quantity;

    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', txn.product_id)
      .single();

    let newStock;
    if (oppositeType === 'IN') newStock = product.stock_quantity + reverseQuantity;
    else if (oppositeType === 'OUT') newStock = product.stock_quantity - reverseQuantity;
    else newStock = product.stock_quantity;

    if (newStock < 0) {
      alert('Cannot reverse: stock would become negative.');
      return;
    }

    const { error: insertError } = await supabase
      .from('stock_movements')
      .insert({
        product_id: txn.product_id,
        movement_type: oppositeType,
        quantity: reverseQuantity,
        reason: `Reversal of ${txn.id}`,
        reference: txn.reference ? `REV-${txn.reference}` : `REV-${txn.id.slice(0,8)}`,
        created_by: 'admin',
      });

    if (insertError) {
      alert('Failed to create reversal transaction.');
      return;
    }

    await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', txn.product_id);

    fetchTransactions();
  }

  function formatMovementType(type) {
    switch (type) {
      case 'IN': return { label: 'IN', class: 'bg-green-100 text-green-800' };
      case 'OUT': return { label: 'OUT', class: 'bg-red-100 text-red-800' };
      case 'ADJ': return { label: 'ADJ', class: 'bg-yellow-100 text-yellow-800' };
      default: return { label: type, class: 'bg-gray-100' };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Transactions</h1>
        <p className="text-gray-500 mt-1">Append‑only ledger — complete movement history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Log</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500">No transactions recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-2 text-sm font-medium">TXN ID</th>
                    <th className="text-left p-2 text-sm font-medium">DATE & TIME</th>
                    <th className="text-left p-2 text-sm font-medium">PRODUCT</th>
                    <th className="text-left p-2 text-sm font-medium">TYPE</th>
                    <th className="text-right p-2 text-sm font-medium">QTY</th>
                    <th className="text-left p-2 text-sm font-medium">REFERENCE</th>
                    <th className="text-left p-2 text-sm font-medium">BY</th>
                    <th className="text-center p-2 text-sm font-medium">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => {
                    const movement = formatMovementType(txn.movement_type);
                    const sign = txn.movement_type === 'IN' ? '+' : (txn.movement_type === 'OUT' ? '-' : '');
                    return (
                      <tr key={txn.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-xs font-mono">{txn.id.slice(0,8)}</td>
                        <td className="p-2 text-sm">{new Date(txn.created_at).toLocaleString()}</td>
                        <td className="p-2">
                          <div className="font-medium">{txn.products?.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{txn.products?.sku}</div>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${movement.class}`}>
                            {movement.label}
                          </span>
                        </td>
                        <td className="p-2 text-right font-mono">{sign}{txn.quantity}</td>
                        <td className="p-2 text-sm">{txn.reference || txn.reason || '—'}</td>
                        <td className="p-2 text-sm">{txn.created_by || 'system'}</td>
                        <td className="p-2 text-center">
                          <Button variant="outline" size="sm" onClick={() => reverseTransaction(txn)} className="text-xs">
                            🔄 Reverse
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-gray-400 text-center border-t pt-4 mt-4">
        Transactions are append‑only. Click "🔄 Reverse" to create an ADJ counter‑entry that nullifies a transaction.
      </div>
    </div>
  );
}