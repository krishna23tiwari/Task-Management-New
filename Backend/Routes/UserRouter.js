const express = require('express')
const router = express.Router()

const userController = require('../Controllers/UserController')

router.post("/signup", userController.SignUpUser)
router.post("/login", userController.login)
router.post("/verify-otp", userController.verifyOtp)
router.post("/resend-otp", userController.resendOtp)
router.get("/count", userController.count)
router.get("/getUsers", userController.getUsers)
router.patch("/toggleAccess", userController.toggleAccess)

module.exports = router
