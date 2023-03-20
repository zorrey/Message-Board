const mongoose = require('mongoose');
//const Reply = require('./reply')

const replySchema = new mongoose.Schema({
    text: {type: String, required: true},
    dateCreated : { type:Date,  required: true, default: Date.now },
    dateUpdated : { type:Date,  required: true, default: Date.now },
    reported: {type: Boolean, required: true , default: false}   ,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
  });


const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    },
    dateAction: {
        type: Date,
        required: true,
        default: Date.now
    },
    reported: {
        type: Boolean,
        required: true,
        default:false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    discussion: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Discussion'
    },
    reply:[replySchema]

})

 messageSchema.pre('findOneAndDelete', async function(next){
    try{ 
        let id = this.getQuery()["_id"];
        console.log('this.id', id)
        const post = await Message.findById(id).exec()
        if( post.reply.length > 0 ){
            console.log(' replies length model pre: ', post.reply.length )
            return next( new Error( 'This message has replies' ) )
        } else {
            console.log( 'success message model pre: ', post.reply.length )
            return  next()
        }
    }catch(error){
        console.log('pre - model error', error)
        return  next( new Error('Error') )
    }
})
   








       
const Message = mongoose.model("Message", messageSchema);
module.exports = Message


