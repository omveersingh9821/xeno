const mongoose = require('mongoose');
const Contact = require('./Contact'); 

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  contacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  }],
});

const User = mongoose.model('User', userSchema);
module.exports = User;

