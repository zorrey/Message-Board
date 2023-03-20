/* const mongoose = require('mongoose')

const replySchema = new mongoose.Schema({
    text: {type: String, required: true},
    dateCreated : { type:Date,  required: true, default: Date.now },
    dateUpdated : { type:Date,  required: true, default: Date.now },
    reported: {type: Boolean, required: true , default: false}   ,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    message: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Message'
    }
  });

  module.exports = mongoose.model('Reply', replySchema) */