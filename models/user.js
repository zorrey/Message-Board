const mongoose = require('mongoose')
require('mongoose-type-email');
mongoose.SchemaTypes.Email.defaults.message = 'Email address is invalid'
const Message = require('./message')
const Discussion = require('./discussion')

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    dateCreated: { type:Date,  required: true, default: Date.now },
    dateUpdated: { type:Date,  required: true, default: Date.now },
    email: {type: mongoose.SchemaTypes.Email , required: true},
    password: {type: String, required: true }
  });


  userSchema.pre('findOneAndDelete', async function(next){
  
    try{
    let id = this.getQuery()["_id"];
    console.log( 'this.id', id )
    const discussions = await Discussion.find( { author: id } )
    const messages = await Message.find( { user: id } )
    const replies = await Message.find( { 'reply.user': id } )
    if(discussions.length > 0){
      console.log( 'users-discussions length model pre: ', discussions.length )
      return   next( new Error('This user has discussions') )
    }else if( messages.length >0){      
      console.log( 'users-messages length model pre: ', messages.length )
      return   next( new Error( 'This user has messages' ) )
    }else if( replies.length > 0){      
      console.log( 'users-replies length model pre: ', replies.length )
      return   next( new Error('This user has replies') )
    }else{      
      console.log('success users model pre: ', discussions.length , messages.length,  replies.length   )
      return  next()
    }
    }catch(e){
      console.log(e)
      return  next(new Error('Error deleting user'))
    }

/*     await Discussion.findById({id}).exec( (err, user)=>{
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
    }) */
}) 


  module.exports = mongoose.model('User', userSchema)