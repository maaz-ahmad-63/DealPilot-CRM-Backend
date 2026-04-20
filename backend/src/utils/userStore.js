const User = require('../models/User');

async function findUserByEmail(email) {
  try {
    if (!email) return null;
    const user = await User.findOne({ email: email.toLowerCase() });
    return user ? {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    } : null;
  } catch (error) {
    console.error('Error finding user by email:', error.message);
    throw error;
  }
}

async function createUser(userData) {
  try {
    if (!userData.email || !userData.name || !userData.passwordHash) {
      throw new Error('Missing required user data');
    }
    
    const user = new User({
      email: userData.email.toLowerCase(),
      name: userData.name,
      passwordHash: userData.passwordHash,
    });
    await user.save();
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
}

async function readUsers() {
  try {
    const users = await User.find().lean();
    return users.map(user => ({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    }));
  } catch (error) {
    console.error('Error reading users:', error.message);
    throw error;
  }
}

module.exports = {
  readUsers,
  findUserByEmail,
  createUser,
};
