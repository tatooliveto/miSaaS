const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: String,
  name: String,
  avatar: String
});

module.exports = mongoose.model('User', userSchema);