const user = require('../models/user')

module.exports = function(app, passport) {

const express = require('express')
const bcrypt = require('bcrypt')
const router= express.Router()
const User = require('../models/user')
const Discussion = require('../models/discussion')
const Message = require('../models/message')
const Reply = require('../models/Reply')
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
console.log("all users: ", allUsers)
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

router.get('/login', checkNotAuthenticated , (req, res) => {
    res.render('users/login.ejs')
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
            //console.log('newUser: ', newUser)
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
    const user = await User.findById(req.user.id)
    const discussions = await Discussion.find({author: req.user.id})
    res.render('users/profile.ejs' , {loggedIn: true, 
                                    name: user.name? user.name : "Guest" ,
                                discussions: discussions},
                            )
})

router.get("/:id" , async (req, res) => {
    let loggedIn = false
    if(req.isAuthenticated()) loggedIn = true
    try{
        console.log(req.params.id)
        const user = await User.findById(req.params.id, {__v:0, password:0, dateUpdated:0, dateCreated:0})
        console.log('/:id - user: ', user)
        const discussions = await Discussion.find({author: req.params.id})
        const messages = await Message.find({user : req.params.id}).populate('discussion').exec()
        console.log('populated message', messages)
        res.render('users/show', {
            loggedIn:loggedIn,
            name: user.name,
            discussions : discussions,
            messages: messages
        })
    }catch(err){

        console.log('error', err)
        res.redirect('/')

    }
   // res.send(`user No ${req.params.id}`)
})
router.get("/:id/edit", checkAuthenticated , (req, res) => {
    res.send(`edit page user No ${req.params.id}`)
})
router.put('/:id', checkAuthenticated  ,(req , res) => {
    res.send(`update user No ${req.params.id}`)
})

router.delete('/:id', checkAuthenticated  ,(req , res) => {
    res.send(`delete user No ${req.params.id}`)
})




return router

}