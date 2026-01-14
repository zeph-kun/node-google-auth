const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, index: true },
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  picture: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
