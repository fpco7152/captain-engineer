'use client';

import { useInventory } from '@/hooks/useInventory';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, Package, TrendingUp, AlertTriangle } from 'lucide-react';

export function InventoryDashboard() {
  const { products, getDashboardStats } = useInventory();
  const stats = getDashboardStats();

  // Prepare data for product type distribution
  const typeDistribution = [
    {
      name: 'Botox',
      value: products.filter((p) => p.type === 'botox').reduce((sum, p) => sum + p.quantity, 0),
    },
    {
      name: 'Filler',
      value: products.filter((p) => p.type === 'filler').reduce((sum, p) => sum + p.quantity, 0),
    },
    {
      name: 'Other',
      value: products.filter((p) => p.type === 'other').reduce((sum, p) => sum + p.quantity, 0),
    },
  ].filter((item) => item.value > 0);

  const COLORS = ['#3b82f6', '#ec4899', '#8b5cf6'];

  // Prepare data for inventory value by product
  const inventoryByProduct = products
    .slice(0, 8)
    .map((p) => ({
      name: p.name.substring(0, 10),
      value: p.quantity * p.costPerUnit,
      quantity: p.quantity,
    }));

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <Package className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inventory Value</p>
              <p className="text-3xl font-bold text-gray-900">${stats.totalValue.toFixed(0)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-3xl font-bold text-gray-900">{stats.lowStockItems}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired Items</p>
              <p className="text-3xl font-bold text-gray-900">{stats.expiredItems}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Value Chart */}
        {inventoryByProduct.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Value</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryByProduct}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Product Type Distribution */}
        {typeDistribution.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Units by Product Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={typeDistribution} cx="50%" cy="50%" labelLine={false} label dataKey="value">
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
