//const passport = require('passport')

function checkRole ( role  ) {
 return ( req, res, next ) => {
    let message
   // console.log('checkAuth----> ', req.session)
    const userRole = req.user.role
    if( role == userRole) {     
      message = 'This is Admin log in.'
      //return next(null, true, {message: message})
       next()
  }
    else { 
      message="ADMIN AUTHORIZATION REQUIRED"
      res.redirect(`/?message=${message}`)
    }
  }
}

module.exports = checkRole