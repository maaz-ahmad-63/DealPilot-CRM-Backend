const User = require('../models/User');

async function findUserByEmail(email) {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    return user;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
}

async function createUser(userData) {
  try {
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
    console.error('Error creating user:', error);
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
    console.error('Error reading users:', error);
    throw error;
  }
}

module.exports = {
  readUsers,
  findUserByEmail,
  createUser,
};
