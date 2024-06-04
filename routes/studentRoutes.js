const express = require('express')
const authControllers = require('./../controllers/authController')
const studentControllers = require('./../controllers/studentController')
const teacherControllers = require('./../controllers/teacherController')

const router = express.Router()
const upload = require('../upload')

// router.route('/update-image-test').post(authControllers.protect,upload.single('image'),studentControllers.Update_the_user_information)
router.route('/').get(authControllers.protect, studentControllers.getAllstudents)
router.route('/updating-user-details').put(authControllers.protect,upload.single('image'),studentControllers.Update_the_user_information)
router.route('/set-lesson/:id').put(authControllers.protect,authControllers.restrictTo(['student']), studentControllers.setLesson)
router.route('/register').post(authControllers.register)
router.route('/login').post(authControllers.login)
router.route('/cancele-lesson/:id').delete(authControllers.protect,studentControllers.CanceleLesson)
router.route('/get-student-lessons').get(authControllers.protect,authControllers.restrictTo(['student']),studentControllers.GetStudentsLessons)
router.route('/validate').get(authControllers.protect,authControllers.validUser)
router.route('/test').post(studentControllers.test)

router.route('/user-deletion').delete(authControllers.protect,authControllers.DeleteUser)

module.exports = router