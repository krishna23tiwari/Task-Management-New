const express = require('express')
const router = express.Router()
const auth = require('../Middleware/auth')


const taskController = require('../Controllers/taskController')

router.post('/addTask', auth, taskController.addTask)
router.delete('/deleteTask/:id', auth, taskController.deleteTask)
router.patch('/updateTasks/:id', auth, taskController.updateTask)
router.patch('/updateStatus/:id', auth, taskController.updateTaskStatus)
router.patch('/toggleDisabled/:id', auth, taskController.toggleTaskDisabled) // New endpoint for toggling disabled status
router.get('/myTasks', auth, taskController.getUserTasks)

// For Dashboard
router.get('/count', taskController.count)
router.get('/disableCount', taskController.disableCount)
router.get('/getTask', taskController.getTasks)
router.get('/getDisabledTasks', taskController.getDisabledTasks)


module.exports = router