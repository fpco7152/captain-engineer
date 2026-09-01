'use client';

import { useState, useEffect } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { InventoryProduct } from '@/lib/types';
import { InventoryDashboard } from './dashboard';
import { ProductsList } from './products-list';
import { ProductForm } from './product-form';
import { ProductDetails } from './product-details';
import { Plus, BarChart3, List } from 'lucide-react';

export default function InventoryPage() {
  const { isLoaded } = useInventory();
  const [view, setView] = useState<'dashboard' | 'products'>('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-700 font-medium">Loading inventory...</p>
        </div>
      </div>
    );
  }

  const handleEdit = (product: InventoryProduct) => {
    setEditingProduct(product);
    setShowAddForm(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Med Spa Inventory Tracker</h1>
              <p className="text-gray-600 mt-1">Manage your botox and filler inventory</p>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingProduct(null);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium self-start md:self-auto"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 mt-6 border-b border-gray-200">
            <button
              onClick={() => setView('dashboard')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                view === 'dashboard'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setView('products')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                view === 'products'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <List className="w-5 h-5" />
              Products
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' ? (
          <InventoryDashboard />
        ) : (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search products by name or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              >
                <option value="all">All Types</option>
                <option value="botox">Botox Only</option>
                <option value="filler">Filler Only</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <ProductsList
                onEdit={handleEdit}
                searchTerm={searchTerm}
                filterType={filterType}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm || editingProduct ? (
        <ProductForm
          product={editingProduct || undefined}
          onClose={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            // Products list will re-render due to hook updates
          }}
        />
      ) : null}

      {/* Product Details Modal */}
      {selectedProduct ? (
        <ProductDetails
          product={selectedProduct}
          onEdit={() => handleEdit(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}
    </div>
  );
}
