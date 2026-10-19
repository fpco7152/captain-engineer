'use server';

import { NextRequest, NextResponse } from 'next/server';
import { userOps, initializeDb } from '@/lib/db';
import { generateToken, setAuthCookie } from '@/lib/auth';

// Initialize DB on startup
initializeDb();

export async function POST(request: NextRequest) {
  try {
    const { action, username, password, email } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    if (action === 'login') {
      const user = userOps.getUserByUsername(username);

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      if (!userOps.verifyPassword(password, user.password_hash)) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      userOps.updateLastLogin(user.id);

      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400,
        path: '/',
      });

      return response;
    }

    if (action === 'register') {
      if (!email) {
        return NextResponse.json(
          { error: 'Email required for registration' },
          { status: 400 }
        );
      }

      try {
        const result = userOps.createUser(username, email, password, 'viewer');
        const user = userOps.getUserByUsername(username);

        const token = generateToken({
          userId: user.id,
          username: user.username,
          role: user.role,
        });

        const response = NextResponse.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
        });

        response.cookies.set('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 86400,
          path: '/',
        });

        return response;
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
