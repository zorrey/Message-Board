const checkAuthenticated = require('./checkAuth')

module.exports = function(app, passport) {

const express = require('express')
const router = express.Router()
const Message = require('../models/message')
const Discussion = require('../models/discussion')

router.get('/', (req, res) => {
    res.redirect('/discussions')
})
router.get("/:id", async (req, res) => {
    try{
        const message = await Message.findById(req.params.id)
        res.redirect(`/discussions/${message.discussion}`)
    }catch{
        res.redirect('/discussions')
    }   
})
router.get("/:id/edit", checkAuthenticated , async (req, res) => {
    try{        
        const post = await Message.findById(req.params.id)
        const discussion = await Discussion.findById(post.discussion)
        res.render('messages/edit',
            { post: post, discussion: discussion})
    }catch(e){
        console.log(e)
        res.redirect('/users/profile')
    }
    
})
router.put('/:id', checkAuthenticated , async (req , res) => {
    let post
    try{
        post = await Message.findOneAndUpdate(
            { _id: req.params.id },
            { text: req.body.text ,
              dateAction: new Date() },
            { new: true }
            )
        
        res.redirect(`/discussions/${post.discussion}`)
        }catch(e){
            res.redirect('user/profile')
        }
})
router.get('/:id/replies', async( req, res ) => {
    res.send('replies - all')
    res.redirect(`messages/${req.params.id}`)
})
router.get('/:id/replies/new', checkAuthenticated , async( req, res ) => {
    let loggedIn = true
    try{
        messagePost = await Message.findById(req.params.id).populate('discussion', 'topic author').populate('user','name').exec()
        res.render('replies/new',
                 {  messagePost: messagePost ? messagePost : new Message() ,
                    message: `${req.user.name}, here you can add an reply to message by: ${messagePost.user.name} on topic: ${messagePost.discussion.topic}.`
            })
    }catch(e){
        console.log(e)
        res.redirect(`/messages/${req.params.id}`)
    }
   // res.send('replies - new')
})
router.post('/:id/replies', checkAuthenticated , async( req, res ) => {
    let loggedIn = true
    try{
        const newReply = {
            text: req.body.text,
            user: req.user.id,
            username: req.user.name
        }
    const messagePost = await Message.findByIdAndUpdate( req.params.id, { $push:{ reply: newReply }}, { new:true } )
     res.redirect(`/messages/${req.params.id}`)

    }catch(e){
        console.log(e)
        res.redirect(`/messages/${req.params.id}`)
    }
   // res.send('replies - create')
})
router.get('/:id/replies/:replyId/edit', checkAuthenticated , async (req, res) => {
    
    try{
        const messagePost = await Message.findById(req.params.id).populate('discussion', 'topic author').exec()
       // console.log('parent', messagePost)
        const reply = await messagePost.reply.id(req.params.replyId)
       // console.log('child: ', reply)
        res.render('replies/edit', {messagePost: messagePost, reply:reply, loggedIn: true})  
    }catch(e){
        res.redirect(`/users/profile`)
    }
})
router.put('/:id/replies/:replyId', checkAuthenticated , async (req, res) => {
    let message
    try{
        const messagePost = await Message.findById( req.params.id)
        replyToUpdate = await messagePost.reply.id(req.params.replyId)
            
        replyToUpdate.text = req.body.text
        replyToUpdate.dateUpdated = new Date()
        await messagePost.save()
        message = 'Reply Updated Successfuly.'
      res.redirect(`/users/profile?message=${message}`)  
    }catch(e){

        res.redirect(`/discussions?error=${e}`)
    }
})
router.delete('/:id', checkAuthenticated, async (req , res) => {
    let message ="Message Deleted Successfuly."
    //const post = Message.findById(req.params.id)
    try{
    const postToDel =  await  Message.findOneAndDelete({ _id: req.params.id })
        res.redirect(`/users/profile?message=${message}`)
    }catch(e){
        console.log(e)
        res.redirect(`/users/profile?error=${e}`)
    }
    //res.send(`delete message No ${req.params.id}`)
})

router.delete('/:id/replies/:replyId', checkAuthenticated , async (req, res) => {
    let message
    try{
        message ='Success. Reply deleted.'
        const post = await Message.findById( req.params.id )
        post.reply.pull(req.params.replyId)
        await post.save()

      res.redirect(`/users/profile?message=${message}`)  
    }catch(e){
        res.redirect(`/users/profile?error=${e}`)
    }
})

return router
}
//module.exports = router