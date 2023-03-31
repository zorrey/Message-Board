const mongoose = require('mongoose');
const Message = require('./message')
const Reply = require('./reply')

const discussionSchema = new mongoose.Schema({
    topic: {
        type: String,
        trim:true,
        required: true
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    },
    dateUpdated: {
        type: Date,
        required: true,
        default: Date.now
    },
    text: {
        type: String,
        trim:true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    reported: {
        type: Boolean, 
        required: true , 
        default: false
    }  
}, { toJSON: { virtuals: true } })
discussionSchema.set('toObject', { virtuals: true });

discussionSchema.pre('findOneAndDelete', async function(next){
    try{ 
        let id = this.getQuery()["_id"];
        console.log( 'this.id', id )
        const messages = await Message.find({discussion:id}).exec()
        if(messages.length > 0){
            console.log('messages length model pre: ', messages.length)
            return   next(new Error('This discussion has messages'))
        } else {
            console.log('success discussion model pre: ', messages.length)
            return  next()
        }
    }catch(error){
        console.log('pre - model error', error)
        return  next(new Error('Error deleting discussion'))
    }
})

discussionSchema.virtual('messages',{
    ref: 'Message',
    localField: '_id',
    foreignField: 'discussion'
}).get(async function(){
    return await Message.find({discussion : this.id}).populate('user', 'name').populate('reply.user', 'name').exec()
})

/* discussionSchema.statics.methods.findUserPosts = async function(userId){
    this.aggregate( [ 
        {
            $lookup:{
                from: messages,
                localField: id,
                foreignField: discussion,
                as: messages
            }
        }
] ) */



  /*   const messages = await Message
        .find({ $or:[ {user : userId} , {'reply.user': userId} ] })
        .populate('user','name').populate('discussion', 'topic author').populate('reply.user', 'name')
        .sort({'discussion': 1 , dateCreated: 1}   ).exec() */
/*         
    return discussions
} */

module.exports = mongoose.model('Discussion', discussionSchema)