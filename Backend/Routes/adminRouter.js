const express = require("express")
const router = express.Router()
const adminController = require('../Controllers/adminController')

router.post("/login", adminController.login)
router.post("/signup", adminController.Signup)
router.get("/count", adminController.count)
router.get("/getAdmins", adminController.getAdmins)
router.patch("/toggleAccess", adminController.toggleAccess)

module.exports = router