const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'कृपया अपना नाम दें'],
    },
    email: {
      type: String,
      required: [true, 'कृपया ईमेल दें'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'कृपया सही ईमेल दें'],
    },
    password: {
      type: String,
      required: [true, 'कृपया पासवर्ड दें'],
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: 'https://via.placeholder.com/150',
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'away'],
      default: 'offline',
    },
    bio: {
      type: String,
      default: '',
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// पासवर्ड को हैश करें सेव करने से पहले
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// पासवर्ड की तुलना करने के लिए method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
