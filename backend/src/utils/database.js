const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp_crm', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.warn('⚠️  Running without database connection. Mock data will be used.');
    // Don't exit - allow server to run without DB
  }
}

module.exports = connectDB;
