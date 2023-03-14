const mongoose = require('mongoose')
//const Reply = require('./reply')



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
    userName: {
        type: String,
        required: true
    },
    discussion: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Discussion'
    }

})

/* messageSchema.pre('findOneAndDelete', function(next){
    let id = this.getQuery()["_id"];
    console.log('this.id', id)

    Reply.find({message: id}, (err, replies)=>{
        console.log('messages length model pre: ', replies.length)
        if(err){ 
            console.log('pre - model error')
          return  next(err)
        }else if( replies.length > 0) {
            console.log('messages length model pre: ', replies.length)
         return   next(new Error('This discussion has messages'))
        }else{
            console.log('success discussion model pre: ', replies.length)
          return  next()
        }
    })
}) */

module.exports = mongoose.model('Message', messageSchema)


