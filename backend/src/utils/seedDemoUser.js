const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seedDemoUser() {
  try {
    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'demo@example.com' });
    if (existingUser) {
      console.log('✓ Demo user already exists');
      return;
    }

    // Create demo user
    const passwordHash = await bcrypt.hash('demo123', 10);
    const demoUser = new User({
      email: 'demo@example.com',
      name: 'Demo User',
      passwordHash,
      role: 'user',
      isActive: true,
      profile: {
        phone: '+1-555-0100',
        bio: 'Demo account for testing DealPilot CRM',
      },
    });

    await demoUser.save();
    console.log('✅ Demo user created: demo@example.com / demo123');
  } catch (error) {
    console.error('❌ Error seeding demo user:', error.message);
    // Don't throw - it's not critical if this fails
  }
}

module.exports = seedDemoUser;
