const express = require('express')
const authControllers = require('./../controllers/authController')
const teacherControllers = require('./../controllers/teacherController')
const router = express.Router()


router.route('/').get(authControllers.protectStudent, teacherControllers.getAllteachers)

router.route('/register').post(authControllers.register)
router.route('/login').post(authControllers.login)
router.route('/available-teachers').post(authControllers.protectStudent, teacherControllers.getAvailableTeachers)
router.route('/update-availability').post(authControllers.protectTeacher,teacherControllers.updateTeacherAvailability)
router.route('/get-teacher-availability/:teacherId').get(authControllers.protectTeacher,teacherControllers.getTeacherAvailability)
router.route('/cancele-date/:id').delete(authControllers.protectTeacher,teacherControllers.CanceleTeacherAvailability)

module.exports = router