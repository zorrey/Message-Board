
function checkNotAuthenticated ( req, res, next ) {
    if( req.isAuthenticated()) {
        if(req.user.role == 'a') return res.redirect('/admin/profile')
       return res.redirect('/users/profile')
    }
    else return next()
}

module.exports = checkNotAuthenticated