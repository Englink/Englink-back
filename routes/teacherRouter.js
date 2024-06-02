const express = require('express')
const authControllers = require('./../controllers/authController')
const teacherControllers = require('./../controllers/teacherController')
const studentControllers = require('./../controllers/studentController')
const upload = require('../upload')

const router = express.Router()


router.route('/').get(teacherControllers.getAllteachers)

router.route('/register').post(authControllers.register)
router.route('/login').post(authControllers.login)
router.route('/available-teachers').get(authControllers.protect,authControllers.restrictTo(['student']), teacherControllers.getAllteachers)
router.route('/update-availability').post(authControllers.protect,authControllers.restrictTo(['teacher']),teacherControllers.updateTeacherAvailability)
router.route('/get-teacher-availability/:id').get(authControllers.protect,teacherControllers.getTeacherAvailability)
router.route('/cancele-availability').delete(authControllers.protect,authControllers.restrictTo(['teacher']),teacherControllers.CanceleTeacherAvailability)
router.route('/get-teacher-lessons').get(authControllers.protect,authControllers.restrictTo(['teacher']),teacherControllers.GetTeacherLessons)
router.route('/updating-user-details').put(authControllers.protect,upload.single('image'),studentControllers.Update_the_user_information)
router.route('/add-review').post(teacherControllers.addStudentReview)
router.route('/get-teacher-reviews/:id').get(teacherControllers.getTeacherReviews)

module.exports = router