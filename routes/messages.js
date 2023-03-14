module.exports = function(app, passport) {

const express = require('express')
const router= express.Router()
const Message = require('../models/message')

router.get('/', (req, res) => {
    res.send("messages router. hello")
})

router.get("/new", (req, res) => {
    res.send('new message')
})

router.post("/", (req, res) => {
    res.send('new message created')
})
router.get("/:id", (req, res) => {
    res.send(`message No ${req.params.id}`)
})
router.put('/:id',(req , res) => {
    res.send(`update message No ${req.params.id}`)
})
router.delete('/:id',(req , res) => {
    res.send(`delete message No ${req.params.id}`)
})
return router
}
//module.exports = router