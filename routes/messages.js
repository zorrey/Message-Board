const express = require('express')
const router= express.Router()


router.get('/', (req, res) => {
    console.log("messages router. hello")
    res.send("messages router. hello")

})

module.exports = router