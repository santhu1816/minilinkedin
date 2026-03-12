const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  headline: {
    type: String,
    default: '',
    trim: true,
  },
  bio: {
    type: String,
    default: '',
  },
  profilePicture: {
    type: String,
    default: '',
  },
  skills: [{
    type: String,
    trim: true,
  }],
  experience: [{
    title: { type: String, trim: true },
    company: { type: String, trim: true },
    duration: { type: String, trim: true },
  }],
  education: [{
    school: { type: String, trim: true },
    degree: { type: String, trim: true },
    year: { type: String, trim: true },
  }],
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
