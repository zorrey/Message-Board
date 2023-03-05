const express = require('express')
const router= express.Router()


router.get('/', (req, res) => {
    console.log("index page. Hello.")
    res.send("Hello World")
})

module.exports = router