# 🔐 Secure Med Spa Inventory Tracker

A production-ready inventory management system with authentication, role-based access, and security best practices.

## ✨ New Features (Secure Version)

### 🔑 Authentication
- **Secure Login/Register** - Username and password authentication
- **Password Hashing** - bcryptjs with 10 rounds
- **JWT Sessions** - Token-based authentication
- **Secure Cookies** - HttpOnly, Secure, SameSite cookies
- **Session Management** - Automatic expiration and cleanup

### 👥 Role-Based Access Control
- **Admin Role** - Full edit access to all inventory, view all activity logs
- **Viewer Role** - Read-only access to dashboard and statistics

### 🎯 Two Interfaces

#### 1. **Admin Dashboard** (Full Editor Access)
- ✅ View all statistics and charts
- ✅ Add new products
- ✅ Edit existing products
- ✅ Delete products
- ✅ Log inventory activity (usage, adjustments, additions)
- ✅ View complete audit trail

#### 2. **Viewer Dashboard** (Read-Only Stats)
- ✅ View inventory statistics
- ✅ See product counts and values
- ✅ Monitor low stock alerts
- ✅ Check expiration warnings
- ✅ NO edit capabilities
- ✅ NO delete capabilities

### 🛡️ Security Features

#### Database Security
- **SQLite with WAL** - Write-Ahead Logging for data integrity
- **SQL Injection Prevention** - Parameterized queries (no string concatenation)
- **Field Validation** - Server-side input validation
- **Data Isolation** - User-specific activity logging

#### Authentication Security
- **Password Hashing** - Bcrypt with salt rounds
- **JWT Tokens** - Cryptographically signed tokens
- **Token Expiration** - 24-hour token lifespan
- **Secure Storage** - Tokens in HttpOnly cookies (not localStorage)
- **CSRF Protection** - SameSite cookie attribute

#### Transport Security
- **HttpOnly Cookies** - Prevents XSS attacks from accessing tokens
- **Secure Cookies** - HTTPS-only in production
- **SameSite Cookies** - Prevents CSRF attacks
- **Rate Limiting Ready** - Structure supports rate limiting implementation

#### API Security
- **Authentication Checks** - Every endpoint verifies token
- **Authorization Checks** - Endpoints verify user role
- **Input Validation** - Server-side validation on all inputs
- **Error Messages** - Generic error messages (don't leak info)

### 📊 Database Schema

#### Users Table
- ID, Username, Email, Password Hash, Role
- Created At, Last Login timestamps
- Indexes on username and email for fast lookups

#### Products Table
- Full inventory fields with timestamps
- Updated At tracking for audit trails
- Indexes on type and date

#### Activity Logs Table
- Complete audit trail of all changes
- Links to user who made the change
- Reason and notes for each action
- Indexed by product, user, and date

#### Sessions Table
- Token-based session management
- Automatic expiration tracking
- Cleanup of expired sessions

## 🚀 Getting Started

### Initialize Database

```bash
npm run init-db
```

This creates:
- Database schema
- Demo Admin user: `admin` / `admin123`
- Demo Viewer user: `viewer` / `viewer123`

### Start the Application

```bash
npm run dev
```

Then open: `http://localhost:3000`

You'll be redirected to `/login`

### Login with Demo Accounts

**Admin Account (Full Editor):**
- Username: `admin`
- Password: `admin123`

**Viewer Account (Stats Only):**
- Username: `viewer`
- Password: `viewer123`

## 📋 Admin User Guide

### Dashboard View
1. See real-time statistics (products, value, alerts)
2. View charts and analytics
3. Monitor inventory health

### Full Editor View
1. **Add Product** - Create new inventory items
2. **Edit Product** - Modify quantities, costs, suppliers
3. **Delete Product** - Remove items (logs are preserved)
4. **Log Activity** - Record usage, adjustments, additions
5. **View History** - See complete audit trail per product

## 📊 Viewer User Guide

### Stats-Only Dashboard
- View total products and inventory value
- See low stock warnings
- Check expired items
- View product distribution charts
- **Cannot** make any changes

## 🔒 Production Deployment Checklist

### Before Going Live

- [ ] **Change Default Passwords**
  ```bash
  # Update admin and viewer account passwords
  ```

- [ ] **Set JWT Secret**
  ```bash
  export JWT_SECRET="your-super-secret-key-generate-with-openssl-rand-64"
  ```

- [ ] **Enable HTTPS** - Required for secure cookies in production

- [ ] **Database Backup**
  ```bash
  # Backup data/inventory.db regularly
  cp data/inventory.db data/inventory.db.backup
  ```

- [ ] **Environment Variables**
  - Set `NODE_ENV=production`
  - Set `JWT_SECRET` to a cryptographically secure random string
  - Configure database path if needed

- [ ] **Security Headers** - Consider adding:
  - Content-Security-Policy
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff

- [ ] **Rate Limiting** - Add middleware to prevent brute force:
  - Login endpoint: 5 attempts per 15 minutes
  - API endpoints: 100 requests per minute per user

## 📈 Scaling Options

### Option 1: PostgreSQL Database
For multi-user production environments:
```bash
npm install pg
# Update lib/db.ts to use PostgreSQL driver
```

### Option 2: Supabase (Recommended)
All-in-one solution with:
- PostgreSQL database
- Built-in authentication
- Real-time capabilities
- Row-level security
- Automatic backups

### Option 3: Self-Hosted Backend
Deploy to:
- Vercel (serverless - current setup)
- AWS Lambda
- DigitalOcean (traditional server)
- Heroku

## 🔧 API Endpoints

### Authentication
- `POST /api/auth` - Login or Register
  - `action`: "login" or "register"
  - `username`: string
  - `password`: string
  - `email`: string (register only)

### Inventory Management
- `GET /api/inventory?action=products` - Get all products
- `GET /api/inventory?action=product&id=<id>` - Get single product
- `GET /api/inventory?action=logs&id=<productId>` - Get activity logs
- `GET /api/inventory?action=stats` - Get dashboard statistics
- `POST /api/inventory` - Create/Update/Delete products or log activity

All endpoints require valid JWT token in cookies.

## 🛠️ Customization

### Add More Users
```typescript
import { userOps } from '@/lib/db';

userOps.createUser('newuser', 'email@example.com', 'password', 'viewer');
```

### Create New Admin User
```typescript
userOps.createUser('manager', 'manager@medspa.com', 'secure-password', 'admin');
```

### Update User Password
```typescript
// Currently not implemented - add endpoint in /api/auth if needed
```

## 🐛 Troubleshooting

### "Cannot find module 'better-sqlite3'"
```bash
npm install better-sqlite3
pnpm install better-sqlite3
```

### "Unauthorized" error after login
- Check browser cookies are enabled
- Clear cookies and log in again
- Verify JWT_SECRET is consistent

### Database locked
- SQLite has built-in concurrency with WAL mode
- Close other database connections
- Restart the application

### Permissions denied on data/inventory.db
```bash
chmod 644 data/inventory.db
chmod 755 data/
```

## 📚 Security Best Practices Implemented

✅ **Password Security**
- Passwords hashed with bcryptjs (10 salt rounds)
- Passwords never logged or transmitted in plaintext

✅ **Session Security**
- Tokens signed with JWT_SECRET
- HttpOnly cookies prevent XSS access
- Secure flag requires HTTPS in production
- SameSite=lax prevents CSRF

✅ **API Security**
- All endpoints require authentication
- Role-based authorization checks
- Parameterized SQL queries prevent injection
- Input validation on all fields

✅ **Data Security**
- Encrypted database file (when using full-disk encryption)
- Activity logs track all changes
- User ID linked to each activity
- Timestamps for audit trails

✅ **Infrastructure**
- HTTPS-ready (cookies marked secure in production)
- Serverless deployment (no persistent server)
- Database WAL mode for data integrity
- Automatic session cleanup

## 🚨 Known Limitations

- **SQLite for Production**: Better for <100 concurrent users
  - Upgrade to PostgreSQL for larger deployments

- **Single Server**: Current deployment single-instance
  - Use load balancer + multiple instances with PostgreSQL for scaling

- **Session Storage**: In-database sessions
  - Can move to Redis for distributed systems

- **File Uploads**: Not implemented
  - Add support via file storage service

## 📞 Support & Feedback

For issues or feature requests:
1. Check database initialization: `npm run init-db`
2. Review environment variables
3. Check browser console for errors
4. Review application logs

## 🎯 Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Email notifications for low stock
- [ ] Supplier cost history and trends
- [ ] Inventory forecasting with ML
- [ ] Mobile app with offline support
- [ ] Advanced reporting and exports
- [ ] Multi-location support
- [ ] Team collaboration features
- [ ] API for third-party integrations
- [ ] Automated reorder point optimization

---

**Version**: 2.0 (Secure Edition)  
**Last Updated**: 2026-10-19  
**Built with**: Next.js 15, React 19, SQLite, JWT, bcryptjs
