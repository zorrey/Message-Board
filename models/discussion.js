const mongoose = require('mongoose')
const Message = require('./message')

const discussionSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    },
    dateActive: {
        type: Date,
        required: true,
        default: Date.now
    },
    article: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

discussionSchema.pre('findOneAndDelete', function(next){
    let id = this.getQuery()["_id"];
    console.log('this.id', id)

    Message.find({discussion: id}, (err, messages)=>{
        console.log('messages length model pre: ', messages.length)
        if(err){ 
            console.log('pre - model error')
          return  next(err)
        }else if( messages.length > 0) {
            console.log('messages length model pre: ', messages.length)
         return   next(new Error('This discussion has messages'))
        }else{
            console.log('success discussion model pre: ', messages.length)
          return  next()
        }
    })
})
module.exports = mongoose.model('Discussion', discussionSchema)