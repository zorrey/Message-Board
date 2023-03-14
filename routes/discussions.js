
module.exports = function(app, passport) {

const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Discussion = require('../models/discussion')
const Message = require('../models/message')
const checkAuthenticated = require('./checkAuth')
const checkNotAuthenticated = require('./checkNotAuth')

router.get("/", async (req, res) => {
    let loggedIn = false
    let name
    let searchDiscussions = {}
    if(req.query.topic != null && req.query.topic !== ""){
        searchDiscussions.topic = new RegExp(req.query.topic, 'i')
    }
    try{
        const allDiscussions = await Discussion.find( searchDiscussions )
        if(req.isAuthenticated()){
            loggedIn = true
            name = req.user.name
        }
        res.render("discussions/index", {
            name: name ? name : 'Guest',
            loggedIn:loggedIn,
            discussions: allDiscussions ? allDiscussions : [],
            searchDiscussions: req.query,
            message: `${name} ` + "Welcome to Agora - the free forum!"
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
        errorMessage: "New Author not created. Field 'name' required."
  })
}else{
    const discussion = new Discussion({
        topic: req.body.topic,
        article: req.body.article,
        author: req.user.id
    })
    try{    
                        
        const newDiscussion = await discussion.save()            
      //  console.log("new discussion saved", newDiscussion)
      res.render('users/profile', {
        loggedIn:true,
        name: req.user.name,
        discussions: await Discussion.find()
})
        
    
    }catch(err){
        console.log(err)
    }
}    
})

router.get("/:id",  async (req, res) => {
let loggedIn = false
//console.log("req.isAuthenticated:   ", req.isAuthenticated())
if(req.isAuthenticated()) loggedIn = true;
    let discussion = await Discussion.findById(req.params.id)
    let author = await User.findById(discussion.author)
    let messages = await Message.find({discussion : req.params.id})
console.log(messages)
//console.log(" discussion.author !== req.user.id",  discussion.author.toString() , req.user.id )

    try{
        res.render('discussions/show', {
            discussion: discussion,
            loggedIn: loggedIn,
            name: author.name,
            messages: messages.length == 0 ?
                 [{text:"no messages",
                     userName: "Nobody wrote message",
                     dateCreated: ""
                }] : messages
        })
    }catch(err){

        console.log('error', err)
        res.redirect('/')

    }
    
   // res.send(`discussion No ${req.params.id}`)
})
router.get("/:id/edit", checkAuthenticated, async (req, res) => {
    //console.log('/:id/edit - req.params', req.params)
   // console.log('/:id/edit - req.user', req.user)  
    const discussion = await Discussion.findById(req.params.id)
    //console.log(discussion)
    //console.log("discussion.author.toString() !== req.user.id" , discussion.author.toString() !== req.user.id ,discussion.author.toString() , req.user.id)
    if( discussion.author.toString() != req.user.id ){
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
            article: req.body.article, 
            dateActive : new Date() },
            {new: true})
    res.redirect(`/discussions/${discussion.id}`) 
    }catch(e){
        console.log( 'discussions - put - err', e )
        res.redirect('/discussions')

    }
   // res.send(`update discussion No ${req.params.id}`)
})
router.delete('/:id',(req , res) => {
    res.send(`delete discussion No ${req.params.id}`)
})

return router

}
//module.exports = router