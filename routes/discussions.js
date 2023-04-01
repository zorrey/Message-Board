
module.exports = function(app, passport) {

const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Discussion = require('../models/discussion')
const Message = require('../models/message')
const Issue = require('../models/issue')
const checkAuthenticated = require('./checkAuth')
const checkNotAuthenticated = require('./checkNotAuth')

router.get("/", async (req, res) => {
    let loggedIn = false
    let name
    let searchDiscussions = {}
    let isAdmin = false
    if(req.query.topic != null && req.query.topic !== ""){
        searchDiscussions.topic = new RegExp(req.query.topic, 'i')
    }
    try{
        const allDiscussions = await Discussion.find( searchDiscussions )        
        if(req.isAuthenticated()){
            loggedIn = true
            name = req.user.name
            if(req.user.role == 'a') isAdmin = true
        }
        res.render("discussions/index", {
            isAdmin:isAdmin,
            name: name ? name : 'Guest',
            loggedIn:loggedIn,
            discussions: allDiscussions ? allDiscussions : [],
            searchDiscussions: req.query,
            message: `${name? name: 'Guest'}, ` + "Welcome to Agora - the free forum!"
        })
    }catch(err){         
        console.log(err)
        res.redirect('/')
    }

})

router.get("/new", checkAuthenticated ,  (req, res) => {
    res.render('discussions/new' , { loggedIn: true , discussion : new Discussion()} )
})

router.post('/', checkAuthenticated , async (req, res) => {
  //  console.log("req.session.passport.user----> ", req.session.passport.user)
  //  console.log("req.user----> ", req.user)
if(!req.body.topic){
    return res.render('discussions/new', {
        discussion : new Discussion(),
        errorMessage: "New Discussion not created. Field 'topic' required."
  })
}else{
    const discussion = new Discussion({
        topic: req.body.topic,
        text: req.body.text,
        user: req.user.id
    })
    try{    
                        
        const newDiscussion = await discussion.save()            
      //  console.log("new discussion saved", newDiscussion)
      res.redirect(`/discussions/${newDiscussion.id}`)
        
    
    }catch(err){
        console.log(err)
    }
}    
})

router.get("/:id",  async (req, res) => {
let loggedIn = false
//console.log("req.isAuthenticated:   ", req.isAuthenticated())
if(req.isAuthenticated()) loggedIn = true;
    let discussion = await Discussion.findById(req.params.id).populate('user','name').exec()
   // let messages = await Message.find({discussion : req.params.id}).populate('user','name').exec()
//console.log('discussions/show', await discussion.messages)
//console.log(" discussion.user !== req.user.id",  discussion.user.toString() , req.user.id )
let message
let errorMessage
if(req.query){
    if(req.query.message) message = req.query.message
    if(req.query.error) errorMessage = req.query.error
}
    try{
        res.render('discussions/show', {
            discussion: discussion,
            loggedIn: loggedIn,
            user: req.user? req.user.id : "",
            messages: await discussion.messages,
            message: message? message:"",
            errorMessage: errorMessage? errorMessage:""
        })
    }catch(err){

        console.log('error', err)
        res.redirect('/')

    }
    
   // res.send(`discussion No ${req.params.id}`)
})
router.get("/:id/edit", checkAuthenticated, async (req, res) => {

    const discussion = await Discussion.findById(req.params.id)    
    if(!discussion) return res.redirect('/users/profile')
    if( discussion.user.toString() != req.user.id ){
        if(req.user.role == 'u') 
        return res.redirect('/users/profile')
    }
    try{
       res.render('discussions/edit',{loggedIn: true, discussion:discussion})

    }catch{
        res.redirect('/')
    }
 //   res.send(`edit discussion No ${req.params.id}`)
})
router.put('/:id', checkAuthenticated , async (req , res) => {
    let discussion

    try{ 
        discussion = await Discussion.findOneAndUpdate({_id: req.params.id},
            {topic: req.body.topic, 
            text: req.body.text, 
            dateUpdated : new Date() },
            {new: true})
    res.redirect(`/discussions/${discussion.id}`) 
    }catch(e){
        //console.log( 'discussions - put - err', e )
        res.redirect('/discussions')

    }
   // res.send(`update discussion No ${req.params.id}`)
})
router.put('/:id/report', checkAuthenticated , async (req , res) => {
    let discussion
    let issue
    let message
    try{ 
        discussion = await Discussion.findOneAndUpdate({_id: req.params.id},
            {reported : true },
            {new: true})
        issue = await new Issue({
            topic: discussion.topic,
            reason: req.body.reason,
            reporter: req.user.id,
            docModel: 'Discussion',
            post: req.params.id,
            reportedUser: discussion.user,
            type: 'Discussion'
        }).save()
        message = `Discussion on topic ${discussion.topic} has been reported.`
    res.redirect(`/discussions/${discussion.id}?message=${message}`) 
    }catch(e){
        console.log( 'discussions - report - err', e )
        message = `Discussion on topic ${discussion.topic} has not been reported. Error reporting.`
        res.redirect(`/discussions/${discussion.id}?message=${message}`) 
}
})
router.get('/:id/messages', (req, res) => {
    try{
        res.redirect(`/discussions/${req.params.id}`)
    }catch(e){
        console.log(e);
        res.redirect('/')
    }
   
})
router.get('/:id/messages/new', checkAuthenticated , async (req, res) => {
    if(!req.params.id){return res.render('users/profile', { errorMessage : "Error. Try again to post messsage."})}
    try{
        const discussion = await Discussion.findById(req.params.id)
        return res.render('messages/new',
                        {   loggedIn:true, 
                            discussion: discussion ,
                            post: new Message()
                        })
    }catch(e){
        console.log("error-/:id/messages/new ---> ", e)
        res.redirect(`/discussions/${req.params.id}`)
    }
    

})
router.post('/:id/messages', checkAuthenticated , async (req, res) => {

   if(!req.params.id) return res.redirect('/discussions')
   const newMessage = new Message({
        text: req.body.text,
        user: req.user.id,
        discussion: req.params.id,
        reply:[]
         })
    try{
       await newMessage.save()
       return res.redirect(`/discussions/${req.params.id}`)

    }catch(e){
        console.log(e)
        res.redirect(`/discussions/${req.params.id}/messages/new`)
    }

})
router.delete('/:id', checkAuthenticated , async (req , res) => {

    let message
    let errorMessage 
    
    const discussion = await Discussion.findById(req.params.id)
    if(!discussion) {
        errorMessage = `Error Deleting. No discussion ${discussion.topic}. `
        return res.redirect(`/users/profile?error=${errorMessage}`) 
    }
    if( discussion.user.toString() != req.user.id ){
        errorMessage = `Error Deleting. You can delete only the discussions started by you.`
        return res.redirect(`/users/profile?error=${errorMessage}`)
    }
    try{
        await Discussion.findOneAndDelete({_id: req.params.id})
        message = "Delete Successful"
        res.redirect(`/users/profile?message=${message}`)
    }catch(e){
        console.log(e)
        res.redirect(`/users/profile?error=${e}`)
    }
   
})

return router

}
//module.exports = router