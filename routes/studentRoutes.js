const express = require('express')
const authControllers = require('./../controllers/authController')
const studentControllers = require('./../controllers/studentController')
const teacherControllers = require('./../controllers/teacherController')

const router = express.Router()


router.route('/').get(authControllers.protect, studentControllers.getAllstudents)
router.route('/set-lesson/:id').put(authControllers.protect,authControllers.restrictTo(['student']), studentControllers.setLesson)

router.route('/register').post(authControllers.register)
router.route('/login').post(authControllers.login)
router.route('/cancele-lesson/:id').delete(authControllers.protect,studentControllers.CanceleLesson)
router.route('/get-student-lessons').get(authControllers.protect,authControllers.restrictTo(['student']),studentControllers.GetStudentsLessons)
router.route('/validate').get(authControllers.protect,authControllers.restrictTo(['student','teacher']),authControllers.validUser)

module.exports = router