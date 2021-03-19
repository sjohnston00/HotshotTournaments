const express = require('express')
const router = express.Router()
const controller = require('../controllers/usersController')

//TODO: Delete in production
router.get('/deleteAllUsers', controller.delete_all_users)

router.post('/login', controller.login)

module.exports = router
