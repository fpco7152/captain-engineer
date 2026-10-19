'use server';

import { NextRequest, NextResponse } from 'next/server';
import { productOps, logOps, initializeDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

initializeDb();

function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

function requireAdmin(user: any) {
  if (!user || user.role !== 'admin') {
    throw new Error('Admin access required');
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = authMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const productId = searchParams.get('id');

    if (action === 'products') {
      const products = productOps.getAllProducts();
      return NextResponse.json({ products });
    }

    if (action === 'product' && productId) {
      const product = productOps.getProductById(productId);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ product });
    }

    if (action === 'logs' && productId) {
      const logs = logOps.getLogsByProduct(productId);
      return NextResponse.json({ logs });
    }

    if (action === 'stats') {
      const products = productOps.getAllProducts();
      const today = new Date().toISOString().split('T')[0];

      const stats = {
        totalProducts: products.length,
        totalValue: products.reduce((sum, p) => sum + (p.quantity * p.cost_per_unit), 0),
        lowStockItems: products.filter((p) => p.quantity <= p.reorder_level).length,
        expiredItems: products.filter((p) => p.expiration_date && p.expiration_date < today).length,
      };

      return NextResponse.json({ stats });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = authMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'create-product') {
      requireAdmin(user);

      const product = {
        id: Date.now().toString(),
        dateAdded: new Date().toISOString().split('T')[0],
        ...body.data,
      };

      productOps.createProduct(product);
      return NextResponse.json({ success: true, product });
    }

    if (action === 'update-product') {
      requireAdmin(user);

      const { id, data } = body;
      productOps.updateProduct(id, data);

      const product = productOps.getProductById(id);
      return NextResponse.json({ success: true, product });
    }

    if (action === 'delete-product') {
      requireAdmin(user);

      const { id } = body;
      productOps.deleteProduct(id);

      return NextResponse.json({ success: true });
    }

    if (action === 'log-activity') {
      const log = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        ...body.data,
      };

      logOps.createLog(log, user.userId);

      // Update product quantity
      const product = productOps.getProductById(log.productId);
      if (product) {
        let quantityChange = 0;
        if (log.action === 'added' || log.action === 'adjusted') {
          quantityChange = log.quantity;
        } else if (log.action === 'used' || log.action === 'removed') {
          quantityChange = -log.quantity;
        }

        productOps.updateProduct(log.productId, {
          quantity: Math.max(0, product.quantity + quantityChange),
        });
      }

      return NextResponse.json({ success: true, log });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
