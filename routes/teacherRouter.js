const express = require('express')
const authControllers = require('./../controllers/authController')
const teacherControllers = require('./../controllers/teacherController')
const router = express.Router()


router.route('/').get(teacherControllers.getAllteachers)

router.route('/available-teachers').post(teacherControllers.getAvailableTeachers)
router.route('/register').post(authControllers.register)
router.route('/login').post(authControllers.login)

module.exports = router