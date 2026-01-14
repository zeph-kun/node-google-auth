const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

const connectDB = async () => {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not set in environment; skipping DB connection');
    return;
  }

  console.log('Attempting to connect to MongoDB:', MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    console.error('Full error:', err);
    throw err;
  }
};

module.exports = connectDB;
