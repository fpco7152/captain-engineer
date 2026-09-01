'use client';

import { useState, useEffect, useCallback } from 'react';
import { InventoryProduct, InventoryLog, DashboardStats } from '@/lib/types';

const PRODUCTS_STORAGE_KEY = 'med-spa-inventory-products';
const LOGS_STORAGE_KEY = 'med-spa-inventory-logs';

export function useInventory() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    const savedLogs = localStorage.getItem(LOGS_STORAGE_KEY);

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
    setIsLoaded(true);
  }, []);

  // Save products to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    }
  }, [products, isLoaded]);

  // Save logs to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    }
  }, [logs, isLoaded]);

  const addProduct = useCallback((product: Omit<InventoryProduct, 'id' | 'dateAdded'>) => {
    const newProduct: InventoryProduct = {
      ...product,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<InventoryProduct>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setLogs((prev) => prev.filter((l) => l.productId !== id));
  }, []);

  const addLog = useCallback(
    (productId: string, action: InventoryLog['action'], quantity: number, reason?: string, notes?: string) => {
      const newLog: InventoryLog = {
        id: Date.now().toString(),
        productId,
        action,
        quantity,
        reason,
        date: new Date().toISOString().split('T')[0],
        notes,
      };

      setLogs((prev) => [...prev, newLog]);

      // Update product quantity
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const quantityChange =
              action === 'added' || action === 'adjusted' ? quantity :
              action === 'used' || action === 'removed' ? -quantity :
              0;
            return {
              ...p,
              quantity: Math.max(0, p.quantity + quantityChange),
            };
          }
          return p;
        })
      );

      return newLog;
    },
    []
  );

  const getProductLogs = useCallback(
    (productId: string) => {
      return logs.filter((l) => l.productId === productId);
    },
    [logs]
  );

  const getDashboardStats = useCallback((): DashboardStats => {
    const today = new Date().toISOString().split('T')[0];
    const expiredItems = products.filter((p) => p.expirationDate && p.expirationDate < today).length;
    const lowStockItems = products.filter((p) => p.quantity <= p.reorderLevel).length;
    const recentUsage = logs.filter((l) => {
      const logDate = new Date(l.date).getTime();
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return l.action === 'used' && logDate > thirtyDaysAgo;
    }).reduce((sum, l) => sum + l.quantity, 0);

    return {
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + p.quantity * p.costPerUnit, 0),
      lowStockItems,
      expiredItems,
      recentUsage,
    };
  }, [products, logs]);

  return {
    products,
    logs,
    isLoaded,
    addProduct,
    updateProduct,
    deleteProduct,
    addLog,
    getProductLogs,
    getDashboardStats,
  };
}
