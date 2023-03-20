const checkAuthenticated = require('./checkAuth')

module.exports = function(app, passport) {

const express = require('express')
const router= express.Router()
const Message = require('../models/message')
const Discussion = require('../models/discussion')

router.get('/', (req, res) => {
    res.redirect('/discussions')
})

router.get("/:id", async (req, res) => {
    try{
        const message = await Message.findById(req.params.id)
        res.redirect('/discussions/message.discussion')
    }catch{
        res.redirect('/discussions')
    }
   
})
router.get("/:id/edit", checkAuthenticated , async (req, res) => {
    try{        
        const post = await Message.findById(req.params.id)
        const discussion = await Discussion.findById(post.discussion)
        res.render('messages/edit',
            { post: post, discussion:discussion})
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
            { text: req.body.text },
            { new: true }
            )
        
        res.redirect(`/discussions/${post.discussion}`)
        }catch(e){
            res.redirect('user/profile')
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
        res.redirect('/')
    }
    //res.send(`delete message No ${req.params.id}`)
})
return router
}
//module.exports = router