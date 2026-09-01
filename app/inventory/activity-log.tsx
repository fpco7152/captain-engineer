'use client';

import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { InventoryProduct } from '@/lib/types';
import { Plus, Minus, Trash2, Edit3 } from 'lucide-react';

interface ActivityLogProps {
  product: InventoryProduct;
}

export function ActivityLog({ product }: ActivityLogProps) {
  const { addLog, getProductLogs } = useInventory();
  const logs = getProductLogs(product.id);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    action: 'used' as const,
    quantity: 1,
    reason: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantity > 0) {
      addLog(product.id, formData.action, formData.quantity, formData.reason, formData.notes);
      setFormData({ action: 'used', quantity: 1, reason: '', notes: '' });
      setShowForm(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'used':
        return <Minus className="w-4 h-4 text-red-500" />;
      case 'added':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'adjusted':
        return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'removed':
        return <Trash2 className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getActionLabel = (action: string) => {
    const labels = {
      used: 'Used',
      added: 'Added',
      adjusted: 'Adjusted',
      removed: 'Removed',
    };
    return labels[action as keyof typeof labels] || action;
  };

  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {showForm ? 'Cancel' : 'Log Activity'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="used">Used</option>
                <option value="added">Added</option>
                <option value="adjusted">Adjusted</option>
                <option value="removed">Removed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Patient treatment, spillage"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Log Activity
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedLogs.length === 0 ? (
          <p className="text-center text-gray-500 py-6">No activity logged yet</p>
        ) : (
          sortedLogs.map((log) => (
            <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{getActionIcon(log.action)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">{getActionLabel(log.action)}</p>
                    <span className="text-sm text-gray-600">
                      {log.quantity} {product.units}
                    </span>
                    <span className="text-xs text-gray-500">{log.date}</span>
                  </div>
                  {log.reason && (
                    <p className="text-sm text-gray-600 mt-1">Reason: {log.reason}</p>
                  )}
                  {log.notes && (
                    <p className="text-sm text-gray-600 mt-1">Notes: {log.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
