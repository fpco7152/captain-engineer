'use client';

import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { InventoryProduct, ProductType, BotoxVariant, FillerType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ProductFormProps {
  product?: InventoryProduct;
  onClose: () => void;
  onSave: () => void;
}

export function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const { addProduct, updateProduct } = useInventory();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    type: product?.type || ('botox' as ProductType),
    botoxVariant: product?.botoxVariant || ('Botox' as BotoxVariant),
    fillerType: product?.fillerType || ('Hyaluronic Acid' as FillerType),
    units: product?.units || 'units',
    quantity: product?.quantity || 0,
    reorderLevel: product?.reorderLevel || 5,
    costPerUnit: product?.costPerUnit || 0,
    supplier: product?.supplier || '',
    batchNumber: product?.batchNumber || '',
    expirationDate: product?.expirationDate || '',
    notes: product?.notes || '',
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('quantity') || name.includes('reorderLevel') || name.includes('costPerUnit')
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    if (formData.quantity < 0 || formData.reorderLevel < 0 || formData.costPerUnit < 0) {
      setError('Quantities and costs must be positive numbers');
      return;
    }

    try {
      if (product) {
        updateProduct(product.id, formData);
      } else {
        addProduct(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError('Failed to save product');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Dysport 300 Units"
              />
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="botox">Botox</option>
                <option value="filler">Filler</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Botox Variant */}
            {formData.type === 'botox' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variant</label>
                <select
                  name="botoxVariant"
                  value={formData.botoxVariant}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Botox">Botox</option>
                  <option value="Dysport">Dysport</option>
                  <option value="Jeuveau">Jeuveau</option>
                  <option value="Xeomin">Xeomin</option>
                </select>
              </div>
            )}

            {/* Filler Type */}
            {formData.type === 'filler' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filler Type</label>
                <select
                  name="fillerType"
                  value={formData.fillerType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Hyaluronic Acid">Hyaluronic Acid</option>
                  <option value="Radiesse">Radiesse</option>
                  <option value="Sculptra">Sculptra</option>
                  <option value="Bellafill">Bellafill</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {/* Units */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
              <input
                type="text"
                name="units"
                value={formData.units}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., units, syringes, vials"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                step="0.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Reorder Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level</label>
              <input
                type="number"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleChange}
                min="0"
                step="0.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Cost Per Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost Per Unit ($) *</label>
              <input
                type="number"
                name="costPerUnit"
                value={formData.costPerUnit}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Batch Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Expiration Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date</label>
              <input
                type="date"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
