module.exports = function(app, passport) {

const express = require('express')
const User = require('../models/user')
const router= express.Router()


router.get('/', (req, res) => {
    let loggedIn = false
    let name
    if(req.isAuthenticated()){
        loggedIn = true
        name = req.user.name
    }
   // let name = "Guest"
    res.render("index" , { loggedIn: loggedIn , name : name ? name : "Guest"  } ) 
})
return router
}
//module.exports = router