'use client';

import { InventoryProduct } from '@/lib/types';
import { ActivityLog } from './activity-log';
import { X } from 'lucide-react';

interface ProductDetailsProps {
  product: InventoryProduct;
  onEdit: () => void;
  onClose: () => void;
}

export function ProductDetails({ product, onEdit, onClose }: ProductDetailsProps) {
  const today = new Date().toISOString().split('T')[0];
  const isExpired = product.expirationDate && product.expirationDate < today;
  const isLowStock = product.quantity <= product.reorderLevel;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Alerts */}
          <div className="space-y-2">
            {isExpired && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  ⚠️ <strong>Expired:</strong> Expiration date was {product.expirationDate}
                </p>
              </div>
            )}
            {isLowStock && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Low Stock:</strong> Current quantity ({product.quantity} {product.units}) is at or below reorder level ({product.reorderLevel} {product.units})
                </p>
              </div>
            )}
          </div>

          {/* Product Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Product Type</p>
              <p className="text-lg font-semibold text-gray-900">{product.type}</p>
            </div>

            {product.type === 'botox' && product.botoxVariant && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Variant</p>
                <p className="text-lg font-semibold text-gray-900">{product.botoxVariant}</p>
              </div>
            )}

            {product.type === 'filler' && product.fillerType && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Filler Type</p>
                <p className="text-lg font-semibold text-gray-900">{product.fillerType}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Current Quantity</p>
              <p className="text-lg font-semibold text-gray-900">
                {product.quantity} {product.units}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Reorder Level</p>
              <p className="text-lg font-semibold text-gray-900">
                {product.reorderLevel} {product.units}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Cost Per Unit</p>
              <p className="text-lg font-semibold text-gray-900">${product.costPerUnit.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Value</p>
              <p className="text-lg font-semibold text-gray-900">
                ${(product.quantity * product.costPerUnit).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Supplier</p>
              <p className="text-lg font-semibold text-gray-900">{product.supplier || 'N/A'}</p>
            </div>

            {product.batchNumber && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Batch Number</p>
                <p className="text-lg font-semibold text-gray-900">{product.batchNumber}</p>
              </div>
            )}

            {product.expirationDate && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Expiration Date</p>
                <p className={`text-lg font-semibold ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                  {product.expirationDate}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Date Added</p>
              <p className="text-lg font-semibold text-gray-900">{product.dateAdded}</p>
            </div>
          </div>

          {product.notes && (
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Notes</p>
              <p className="text-gray-700 whitespace-pre-wrap">{product.notes}</p>
            </div>
          )}

          {/* Activity Log */}
          <div className="border-t border-gray-200 pt-6">
            <ActivityLog product={product} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Edit Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
