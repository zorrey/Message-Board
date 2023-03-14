
function checkNotAuthenticated ( req, res, next ) {
    if( req.isAuthenticated()) res.redirect('/users')
    else return next()
}

module.exports = checkNotAuthenticated