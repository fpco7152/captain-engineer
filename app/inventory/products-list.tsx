'use client';

import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { InventoryProduct } from '@/lib/types';
import { Edit2, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';

interface ProductsListProps {
  onEdit: (product: InventoryProduct) => void;
  searchTerm: string;
  filterType: string;
}

export function ProductsList({ onEdit, searchTerm, filterType }: ProductsListProps) {
  const { products, deleteProduct } = useInventory();
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'value' | 'expiration'>('name');

  const filtered = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || p.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'quantity':
          return b.quantity - a.quantity;
        case 'value':
          return (b.quantity * b.costPerUnit) - (a.quantity * a.costPerUnit);
        case 'expiration':
          return (a.expirationDate || '9999-12-31').localeCompare(b.expirationDate || '9999-12-31');
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const today = new Date().toISOString().split('T')[0];

  const isLowStock = (product: InventoryProduct) => product.quantity <= product.reorderLevel;
  const isExpired = (product: InventoryProduct) => product.expirationDate && product.expirationDate < today;
  const isExpiringSoon = (product: InventoryProduct) => {
    if (!product.expirationDate) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(product.expirationDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No products added yet. Add your first product to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium"
          >
            <option value="name">Sort by Name</option>
            <option value="quantity">Sort by Quantity</option>
            <option value="value">Sort by Value</option>
            <option value="expiration">Sort by Expiration</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">{filtered.length} products</p>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cost</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Supplier</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Expiration</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    {product.batchNumber && <p className="text-xs text-gray-500">Batch: {product.batchNumber}</p>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {product.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {product.quantity} {product.units}
                    </p>
                    <p className="text-xs text-gray-500">Reorder: {product.reorderLevel}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">
                    ${(product.quantity * product.costPerUnit).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">${product.costPerUnit.toFixed(2)}/unit</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{product.supplier}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {product.expirationDate || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {isExpired(product) && (
                      <div className="flex items-center gap-1 text-red-600" title="Expired">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    )}
                    {isExpiringSoon(product) && !isExpired(product) && (
                      <div className="flex items-center gap-1 text-yellow-600" title="Expiring soon">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                    {isLowStock(product) && (
                      <div className="flex items-center gap-1 text-orange-600" title="Low stock">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                    {!isExpired(product) && !isExpiringSoon(product) && !isLowStock(product) && (
                      <span className="text-xs text-green-600 font-medium">OK</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this product?')) {
                          deleteProduct(product.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
