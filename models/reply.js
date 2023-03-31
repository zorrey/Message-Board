const mongoose = require('mongoose')
//const Message = require('./message')

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

/*     replySchema.virtual('discussion').get(async function(){
    const message = await Message.findById(this.message).populate('discussion').exec()
    return message.discussion
  }) */
/*     replySchema.methods.findUserPosts = async function(userId){
    const messages = await Message.find({})    
    const replies = await Reply.find({user: userId})

    return doc
} */
  module.exports = mongoose.model('Reply', replySchema)