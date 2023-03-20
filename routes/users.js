const user = require('../models/user')

module.exports = function(app, passport) {

const express = require('express')
const bcrypt = require('bcrypt')
const router= express.Router()
const User = require('../models/user')
const Discussion = require('../models/discussion')
const Message = require('../models/message')
const Reply = require('../models/reply')
const checkAuthenticated = require('./checkAuth')
const checkNotAuthenticated = require('./checkNotAuth')



router.get('/' , async (req, res) => {
    let loggedIn = false
    let name
    if(req.isAuthenticated()){
        loggedIn = true
        name = req.user.name
    }else{
        name = 'Guest'
    }
    let searchNames = {}
    if(req.query.name != null && req.query.name !== ""){
        searchNames.name = new RegExp(req.query.name, 'i')
    }
    try{
        const allUsers = await User.find( searchNames , { password:0, dateCreated:0, dateUpdated:0, email:0 , __v: 0} )
       // const userNames = []

      /*   allUsers.forEach(user => {
            userNames.push({name: user.name})
        }) */
        res.render("users/index", {
            loggedIn: loggedIn,
            allUsers: allUsers ,
            searchNames: req.query,
            message: `${name}, Welcome to Agora - the free forum!`
        })
    }catch(err){         
            console.log(err)
        res.redirect('/')
    }

})

router.get('/login', checkNotAuthenticated , async (req, res) => {
    let errorMessage
    if(req.query.message) errorMessage = req.query.error
    res.render('users/login.ejs',{ errorMessage: errorMessage ? errorMessage : "" })
})

router.post('/login', checkNotAuthenticated , passport.authenticate('local', {
    successRedirect: '/users/profile',
    failureRedirect: '/users/login',
    failureFlash: true,
    maxAge: 3600000
} )
)


router.get("/register", checkNotAuthenticated ,(req, res) => {
    try{
    res.render('users/register.ejs')
    }catch{
        res.redirect('/users/profile')    
    }
})

router.post("/register", checkNotAuthenticated ,async (req, res) => {
    if(!req.body.name || !req.body.password || !req.body.email){
        return res.redirect('users/register')  
    }else {
    const hashedPass = await bcrypt.hash(req.body.password, 10)
    const newUser = new User({
        name:req.body.name,
        email:req.body.email ,
        password: hashedPass
    })
    try{
        await newUser.save()
            res.redirect('/users/login')
        }catch(e){
            console.log(e)
            res.redirect('/users/register')    
        }
    }
})

router.delete('/logout' , checkAuthenticated , (req, res, next) => {
    req.logOut( function(err){
        if(err) return next(err)
        res.redirect('/')
    })
    
})

router.get('/profile', checkAuthenticated , async (req, res) => {
//console.log('query--->', req.query)
let message 
let errorMessage
if(req.query){
    if(req.query.message){
    message = req.query.message
}
    if(req.query.error){
    errorMessage = req.query.error
}}

    try{        
        const discussions = await Discussion.find({author: req.user.id})
        const messages = await Message.find({$or: [ {user: req.user.id},{"reply.user": req.user.id}] }).populate('discussion').populate('user','name').sort({discussion:1, dateCreated:1}).exec()
   // console.log('profile -messages: ', messages)
        res.render('users/profile.ejs' , {
                    loggedIn: true, 
                    name: req.user.name? req.user.name : "Guest" ,
                    userId: req.user.id,
                    discussions: discussions ? discussions : [],
                    messages: messages ? messages : [],
                    errorMessage: errorMessage ? errorMessage :"",
                    message: message? message : ""
            }
        )
    }catch(e){
        console.log(e)
        res.redirect('/')
    }
  
})


router.get("/edit", checkAuthenticated , async (req, res) => {
    let loggedIn = true
    if(!req.user.id) return res.redirect('/users/profile?error=login_error')
    try{
        const email = req.user.email
        res.render('users/edit', {email: email? email : "", loggedIn:loggedIn})
        
    }catch(e){
        
        console.log('error', e)
        res.redirect('/')
    }
    //res.send(`edit page user No ${req.params.id}`)
})

router.put("/edit", checkAuthenticated , async (req, res) => {
    let loggedIn = true
    if(!req.user.id) return res.redirect('/users/profile?error=Error Updating')
    const hashedPass = await bcrypt.hash(req.body.password, 10)
    try{
        const user = await User.findByIdAndUpdate(req.user.id, 
            {   name: req.body.name, 
                email: req.body.email,
                password:hashedPass,
                dateUpdated: new Date(),
                loggedIn: loggedIn 
            },
            {new: true}
        )
        
        res.redirect(`/users/profile?message=Success Updating`)
    }catch(e){
        console.log(e)
        res.redirect(`/users/profile?error=Error while updating`)
    }
    //res.send(`edit page user No ${req.params.id}`)
})

router.get("/:id" , async (req, res) => {
    let loggedIn = false
    if(req.isAuthenticated()) loggedIn = true
    try{
        const user = await User.findById(req.params.id, {__v:0, password:0, dateUpdated:0, dateCreated:0})
        const discussions = await Discussion.find({author: req.params.id})
        const messages = await Message.find( {$or:[{user : req.params.id} , {'reply.user': req.params.id} ]}).populate('user','name').populate('discussion', 'topic author').populate('reply.user', 'name').exec()
        res.render('users/show', {
            loggedIn:loggedIn,
            name: user.name,
            discussions : discussions,
            messages: messages
        })
    }catch(err){

        console.log('error', err)
        res.redirect(`/?error=${e}`)

    }
   // res.send(`user No ${req.params.id}`)
})


/* router.put('/:id', checkAuthenticated  ,(req , res) => {
    res.send(`update user No ${req.params.id}`)
})
 */
router.delete( '/delete', checkAuthenticated  , async ( req , res ) => {
    const user = await User.findById(req.user.id)
    let errorMessage
    if( !user ){
        errorMessage = "Error. User profile/credential error."
        return res.redirect(`/users/profile?error=${errorMessage}`)
    }
  
    try{
        await User.findOneAndDelete({ _id: req.user.id })
        res.redirect('/?message:User Deleted')
    }catch(e){
        errorMessage = "Error deleting user."
        console.log(e)
        res.redirect(`/users/profile?error=${e}`)
    }
    
    //res.send(`delete user No ${req.params.id}`)
})




return router

}