module.exports = function(app, passport) {

const express = require('express')
const User = require('../models/user')
const router= express.Router()


router.get('/', (req, res) => {
    let loggedIn = false
    let name
    let message
    let errorMessage
    if(req.query){
        if(req.query.message) message = req.query.message
        if(req.query.error) errorMessage = req.query.error
    }

    
    if(req.isAuthenticated()){
        loggedIn = true
        name = req.user.name
    }
   // let name = "Guest"
    res.render("index" , 
    {   loggedIn: loggedIn , name : name ? name : "Guest" ,
        errorMessage: errorMessage ? errorMessage :"",
        message: message ? message :""
 } ) 
})
return router
}
//module.exports = router