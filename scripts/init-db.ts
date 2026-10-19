import { userOps, initializeDb } from './lib/db';

console.log('🔧 Initializing Med Spa Inventory database...');

try {
  initializeDb();
  console.log('✓ Database schema created');

  // Create default admin user
  try {
    userOps.createUser('admin', 'admin@medspa.local', 'admin123', 'admin');
    console.log('✓ Admin user created: admin / admin123');
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log('✓ Admin user already exists');
    } else {
      console.error('✗ Failed to create admin user:', error.message);
    }
  }

  // Create default viewer user
  try {
    userOps.createUser('viewer', 'viewer@medspa.local', 'viewer123', 'viewer');
    console.log('✓ Viewer user created: viewer / viewer123');
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log('✓ Viewer user already exists');
    } else {
      console.error('✗ Failed to create viewer user:', error.message);
    }
  }

  console.log('\n🎉 Database initialization complete!');
  console.log('\n📋 Demo Credentials:');
  console.log('   Admin:  admin / admin123');
  console.log('   Viewer: viewer / viewer123');
  console.log('\n🔐 Security Tips:');
  console.log('   • Change default passwords immediately');
  console.log('   • Set JWT_SECRET env variable in production');
  console.log('   • Use HTTPS in production');
  console.log('   • Keep Node.js and dependencies updated');

  process.exit(0);
} catch (error) {
  console.error('✗ Database initialization failed:', error);
  process.exit(1);
}
