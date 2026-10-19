'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, BarChart3, Lock } from 'lucide-react';
import { InventoryDashboard } from '@/app/inventory/dashboard';
import { ProductsList } from '@/app/inventory/products-list';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'products'>('dashboard');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/inventory?action=products');
        if (response.status === 401) {
          router.push('/login');
          return;
        }

        // Get user from session - in production, you'd have an API endpoint for this
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Med Spa Inventory</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {isAdmin ? (
                    <>
                      <Lock className="w-4 h-4 mr-1" />
                      Admin Access
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Viewer Mode
                    </>
                  )}
                </span>
                <span className="text-gray-600 text-sm">Logged in as: {user?.username}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          {/* Navigation */}
          {isAdmin && (
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
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  view === 'products'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                Full Editor
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdmin ? (
          view === 'dashboard' ? (
            <InventoryDashboard />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Inventory Editor</h2>
              <ProductsList onEdit={() => {}} searchTerm="" filterType="all" />
            </div>
          )
        ) : (
          // Viewer mode - read-only dashboard
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>Viewer Mode:</strong> You can view inventory statistics and product information, but cannot make changes.
              </p>
            </div>
            <InventoryDashboard />
          </div>
        )}
      </div>
    </div>
  );
}
