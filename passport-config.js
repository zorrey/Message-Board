
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')



function ini( passport, getUserByEmail, getUserById ) {
    
    const authenticateUser = async ( email, password , done) => {
     //   console.log("email, pass",  email, password)
    const user = await getUserByEmail(email)
   // console.log("user in ini", user)
    if( user == null ) return done(null, false, {message : "No user with that email"})
    try{
        //console.log("password, user.password : ", password, user.password)
        //console.log("await bcrypt.compare(password , user.password )", await bcrypt.compare(password , user.password ))

        if( await bcrypt.compare(password , user.password )) {
        return done(null, user)
        }else{
            return done(null, false, {message : "Password incorrect"})
        }
    }catch(e){
       return done(e)
    }
    }

    passport.use( new LocalStrategy({ usernameField : 'email' , passwordField: 'password' } , 
                  authenticateUser  )    
                  )
    passport.serializeUser( (user , done) => {  
             //   console.log('serializeUser----->', user)
                done( null, user.id ) 
            })
    passport.deserializeUser( async (id , done) => {   
      //  console.log('deserializeUser--id--->', id)
       return done( null, await getUserById(id) )   
     })
}

module.exports = ini