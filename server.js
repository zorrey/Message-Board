'use strict';
require('dotenv').config()

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const methodOverride = require("method-override")
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const flash = require('express-flash')
const session = require('express-session')
//const filestore = require("session-file-store")(session)
const mongoose = require('mongoose')
const User = require('./models/user')

const messagesRouter = require("./routes/messages")
const discussionRouter = require("./routes/discussions")
const mainRouter = require("./routes/index")
const userRouter = require("./routes/users")
const adminRouter = require("./routes/admin")



//setting up application
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')


app.use(session({
    name: "session-id",
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false,
    cookie: { maxAge: 1000 * 60 * 60 }
}))

app.use(bodyParser.urlencoded({ limit:'10mb', extended: false }))
app.use(bodyParser.json())
app.use(expressLayouts)
app.use(express.static('public'))

app.use(passport.initialize())
app.use(passport.session())

const initializePassport = require('./passport-config')
initializePassport(passport, 
    async (email) => { return await User.findOne({email: email} ) } ,
    async (id) => { return await User.findById(id) }
)
app.use(flash())
app.use(methodOverride('_method'))
//setting up database
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', (error) => { console.error(error) })
db.once('open', () => { console.log('conected to database')})

//routers
app.use('/', mainRouter(app, passport))
app.use('/messages', messagesRouter(app, passport))

app.use('/users', userRouter(app, passport))
app.use('/discussions', discussionRouter(app, passport))
app.use('/admin', adminRouter(app, passport))





app.listen( process.env.PORT || 3000 )