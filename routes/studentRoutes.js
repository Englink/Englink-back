const express = require('express')
const authControllers = require('./../controllers/authController')
const studentControllers = require('./../controllers/studentController')
const router = express.Router()


router.route('/').get(studentControllers.getAllstudents)

router.route('/register').post(authControllers.register)
router.route('/login').post(authControllers.login)

module.exports = router