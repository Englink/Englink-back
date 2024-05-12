const express = require('express')
const authControllers = require('./../controllers/authController')
const studentControllers = require('./../controllers/studentController')
const teacherControllers = require('./../controllers/teacherController')

const router = express.Router()


router.route('/').get(authControllers.protectStudent, teacherControllers.getAllteachers)

router.route('/register').post(authControllers.register)
router.route('/login').post(authControllers.login)

module.exports = router