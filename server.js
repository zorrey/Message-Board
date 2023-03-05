require('dotenv').config()

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const messagesRouter = require("./routes/messages")
const mainRouter = require("./routes/index")
const mongoose = require('mongoose')
//setting up application
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit:'10mb', extended: false}))

//setting  updatabase
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', (error) => { console.error(error) })
db.once('open', () => { console.log('conected to database')})

//routers
app.use('/', mainRouter)
app.use('/messages', messagesRouter)

app.listen( process.env.PORT || 3000 )