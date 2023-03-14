const mongoose = require('mongoose')
require('mongoose-type-email');
mongoose.SchemaTypes.Email.defaults.message = 'Email address is invalid'

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    dateCreated: { type:Date,  required: true, default: Date.now },
    dateUpdated: { type:Date,  required: true, default: Date.now },
    email: {type: mongoose.SchemaTypes.Email , required: true},
    password: {type: String, required: true }
  });

  module.exports = mongoose.model('User', userSchema)