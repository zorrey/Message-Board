const user = require('../models/user')
const mongoose = require('mongoose');
module.exports = function(app, passport) {

const express = require('express')
const bcrypt = require('bcrypt')
const router= express.Router()
const User = require('../models/user')
const Discussion = require('../models/discussion')
const Message = require('../models/message')
//const Reply = require('../models/reply')
const checkAuthenticated = require('./checkAuth')
const checkNotAuthenticated = require('./checkNotAuth')
const checkRole = require('./checkRole')
const regExpName = new RegExp(/^[a-zA-Z0-9]+$/)



router.get('/' , async (req, res) => {
    let loggedIn = false
    let name
    let isAdmin = false
    if(req.isAuthenticated()){
        loggedIn = true
        name = req.user.name
        if(req.user.role == 'a') isAdmin = true
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
            isAdmin:isAdmin,
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

router.get('/redirect', checkAuthenticated, (req, res) =>{
    let errorMessage = ""
    let message = ""
    if(req.query){
        if( req.query.message ){
        message = req.query.message
    }
        if( req.query.error ){
        errorMessage = req.query.error
    }}   
    try{
        if(req.user.role == 'a') res.redirect(`/admin/profile?message=${message}&errorMessage=${errorMessage}`)
        if(req.user.role == 'u') res.redirect(`/users/profile?message=${message}&errorMessage=${errorMessage}`)
    }catch(e){
        res.redirect(`/?error=${e}`)
    }
  
})
router.get('/login', checkNotAuthenticated , async (req, res) => {
    let errorMessage
    let message
    if(req.query.message) message = req.query.message
    if(req.query.error) errorMessage = req.query.error
    res.render('users/login.ejs',{        
        errorMessage: errorMessage ? errorMessage : "" ,
        message: message ? message : "" 
    })
})

router.post('/login', checkNotAuthenticated , passport.authenticate('local', {
    successRedirect:  '/users/redirect',
    failureRedirect: '/users/login',
    failureFlash: true,
    maxAge: 3600000
} )
)

router.get("/register", checkNotAuthenticated , (req, res) => {
let message
let errorMessage
if(req.query){
    if(req.query.message) message = req.query.message
    if(req.query.error) errorMessage = req.query.error
}
    try{
    res.render('users/register.ejs', 
    {errorMessage: errorMessage ? errorMessage : "",
    message: message ? message : ""

 })
    }catch{
        res.redirect(`/?message=${errorMessage}`)    
    }
})

router.post("/register", checkNotAuthenticated , async (req, res) => {
    let message
    if(!req.body.name || !req.body.password || !req.body.email){
        return res.redirect('users/register')  
    } else if(!regExpName.test(req.body.name) || !regExpName.test(req.body.password) )    {
        message = " Only letters and numbers allowed in the name and password."
        return res.redirect(`/users/register?message=${message}`)    
    } else {
    const userName = await User.find({name: req.body.name}) 
    const userEmail = await User.find({email: req.body.email}) 
    if(userName.length >0) { 
        message = 'There is already a user with this name.'
        return res.redirect(`/users/register?message=${message}`)  
    }
    if(userEmail.length >0) { 
        message = 'There is already a user with this email.'
        return res.redirect(`/users/register?message=${message}`)  
    }
    
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
let userId
let isAdmin = false
if( req.user.role == 'a' ){
    userId = req.query.id
    userName = req.query.name
    isAdmin = true
} 
else{
    userId = req.user.id
    userName = req.user.name
}
if(req.query){
    if( req.query.message ){
    message = req.query.message
}
    if( req.query.error ){
    errorMessage = req.query.error
}}

    try{        
        const discussions = await Discussion.find({ user: userId })
        const messages = await Message.find({$or: [ { user: userId },{"reply.user": userId}] }).populate('discussion').populate('user','name').sort({discussion:1, dateCreated:1}).exec()
   
       /*  const result = await Message.aggregate([
            {    $lookup: {
                    from: 'replies',
                    localField: '_id',
                    foreignField: 'message',
                     pipeline: [
                    { "$match": {   "$expr":     { $eq: [ userId , "$user".toString() ] } ,   }
                    },    ], 
                    as: 'reply'
                } }           
        ]) */
      
      console.log('profile -messages: ', messages)
   //console.log('profile -user: ', req.user, userName)
        res.render('users/profile.ejs' , {
                    loggedIn: true, 
                    isAdmin: isAdmin,
                    name: userName? userName : "Guest" ,
                    userId: userId ,
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
    let isAdmin = false
    if(req.user.role == 'a') isAdmin = true
    if(!req.user.id) return res.redirect('/users/profile?error=login_error')
    try{
        const email = req.user.email
        res.render('users/edit', {email: email? email : "", loggedIn:loggedIn, isAdmin: isAdmin})
        
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
        
        res.redirect(`/users/redirect?message=Success Updating`)
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
        const discussions = await Discussion.find({user: req.params.id})
        const messages = await Message.find( {$or:[{user : req.params.id} , {'reply.user': req.params.id} ]})
                        .populate('user','name')
                        .populate('discussion', 'topic author')
                        .populate('reply.user', 'name')
                        .sort({ discussion: 1 , dateCreated:1 })
                        .exec()
        await                 
        res.render('users/show', {
            loggedIn:loggedIn,
            user: user,
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