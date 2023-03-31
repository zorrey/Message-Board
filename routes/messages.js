const checkAuthenticated = require('./checkAuth')

module.exports = function(app, passport) {

const express = require('express')
const router = express.Router()
const Message = require('../models/message')
const Discussion = require('../models/discussion')
const Issue = require('../models/issue')
//const Reply = require('../models/reply')


router.get("/:id/edit", checkAuthenticated , async (req, res) => {
    try{        
        const post = await Message.findById(req.params.id)
        const discussion = await Discussion.findById(post.discussion)
        res.render('messages/edit',
            { post: post, discussion: discussion, loggedIn:true})
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
              dateUpdated: new Date() },
            { new: true }
            )
        
        res.redirect(`/discussions/${post.discussion}`)
        }catch(e){
            res.redirect('user/profile')
        }
})
router.put('/:id/report', checkAuthenticated , async (req , res) => {
    let post
    let issue
    let message
    try{ 
        post = await Message.findOneAndUpdate({_id: req.params.id},
            {reported : true },
            {new: true})
       const discussion = await Discussion.findById(post.discussion)   
        issue = await new Issue({
            topic: discussion.topic,
            reason: req.body.reason,
            reporter: req.user.id,
            reportedUser: post.user,
            docModel: 'Message',
            type: 'Message',
            post: req.params.id,
        }).save()
        message = 'Post Reported Successfuly.'
    res.redirect(`/discussions/${discussion.id}?message=${message}`) 
    }catch(e){
        message = "Error reporting. Post not reported."
        console.log( 'discussions - report - err', e )
        res.redirect(`/discussions/${discussion.id}?message=${message}`)
    }
})

router.get('/:id/replies/new', checkAuthenticated , async( req, res ) => {
    let loggedIn = true
    try{
        messagePost = await Message.findById(req.params.id).populate('discussion', 'topic user').populate('user','name').exec()
        res.render('replies/new',
                 {  messagePost: messagePost ? messagePost : new Message() ,
                    loggedIn: loggedIn,
                    message: `${req.user.name}, here you can add an reply to message by: ${messagePost.user.name} on topic: ${messagePost.discussion.topic}.`
            })
    }catch(e){
        console.log(e)
        res.redirect(`/users/profile`)
    }
   // res.send('replies - new')
})
router.post('/:id/replies', checkAuthenticated , async( req, res ) => {
    let loggedIn = true
    try{
        const post = await Message.findById(req.params.id)
        const newReply = {
            text: req.body.text,
            user: req.user.id
        }
        post.reply.push(newReply)
        await post.save()

     res.redirect(`/discussions/${post.discussion}`)

    }catch(e){
        console.log(e)
        res.redirect(`/users/profile`)
    }
   // res.send('replies - create')
})
router.get('/:id/replies/:replyId/edit', checkAuthenticated , async (req, res) => {
    
    try{
        const messagePost = await Message.findById(req.params.id).populate('discussion', 'topic user').exec()
       // console.log('parent', messagePost)
        const reply = await messagePost.reply.id(req.params.replyId)
       // console.log('child: ', reply)
        res.render('replies/edit', { messagePost: messagePost, reply:reply, loggedIn: true })  
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
router.put('/:id/replies/:replyId/report', checkAuthenticated , async (req , res) => {
    let post
    let issue
    let message
    try{ 
        post = await Message.findById({_id: req.params.id }).populate('discussion')
        const reply = await post.reply.id(req.params.replyId)
        reply.reported = true
        await post.save()
            console.log('post reply -reported: ', reply)
        issue = await new Issue({
            topic: post.discussion.topic,
            reason: req.body.reason,
            reporter: req.user.id,
            type:'Reply',
            docModel: 'Message',
            post: req.params.replyId,
            reportedUser: post.user
        })  
        await issue.save()
    message = `Post on ${discussion.topic} topic has been reported.`    

    res.redirect(`/discussions/${post.discussion.id}?message=${message}`) 
    }catch(e){
        message = "Error reporting post. Post has not been reported."
        console.log( 'discussions - report - err', e )
        res.redirect(`/discussions/${post.discussion.id}?message=${message}`)
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