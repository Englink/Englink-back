const express = require('express')
const authControllers = require('./../controllers/authController')
const teacherControllers = require('./../controllers/teacherController')
const router = express.Router()


router.route('/').get(teacherControllers.getAllteachers)

router.route('/register').post(authControllers.register)
router.route('/login').post(authControllers.login)
router.route('/available-teachers').get(authControllers.protect,authControllers.restrictTo(['student']), teacherControllers.getAllteachers)
router.route('/update-availability').post(authControllers.protect,authControllers.restrictTo(['teacher']),teacherControllers.updateTeacherAvailability)
router.route('/get-teacher-availability/:id').get(authControllers.protect,teacherControllers.getTeacherAvailability)
router.route('/cancele-availability/:id').delete(authControllers.protect,authControllers.restrictTo(['teacher']),teacherControllers.CanceleTeacherAvailability)

module.exports = router