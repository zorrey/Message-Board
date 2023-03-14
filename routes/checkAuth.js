//const passport = require('passport')

function checkAuthenticated ( req, res, next ) {
  //  console.log('checkAuth----> ', req.session)
    if( req.isAuthenticated()) return next()
    else res.redirect('/users/login')
}

module.exports = checkAuthenticated