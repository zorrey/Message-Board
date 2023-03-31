module.exports = function(app, passport) {

const express = require('express')
const User = require('../models/user')
const router= express.Router()


router.get('/', (req, res) => {
    let loggedIn = false
    let name
    let message
    let errorMessage
    let isAdmin = false
    if(req.query){
        if(req.query.message) message = req.query.message
        if(req.query.error) errorMessage = req.query.error
    }

    
    if(req.isAuthenticated()){
        loggedIn = true
        name = req.user.name
        if(req.user.role == 'a') isAdmin = true
    }
    

   // let name = "Guest"
    res.render("index" , 
    {   isAdmin: isAdmin,
        loggedIn: loggedIn , 
        name : name ? name : "Guest" ,
        errorMessage: errorMessage ? errorMessage :"",
        message: message ? message :""
 } ) 
})
return router
}
//module.exports = router