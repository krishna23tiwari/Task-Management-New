require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors');
const app = express()
const port = process.env.PORT
const fileUpload = require('express-fileupload')



const taskRouter = require("./Routes/taskRouter")
const userRouter = require("./Routes/userRouter")
const adminRouter = require('./Routes/adminRouter')

app.use(cors())
app.use(express.json())
app.use(fileUpload())
app.use(express.urlencoded({ extended: true }))

const mongoURL = process.env.MONGO_URL

mongoose.connect(mongoURL)
  .then(() => console.log("DB connected"))
  .catch(() => console.log("DB connection failed"))

app.use("/user", userRouter)
app.use("/task", taskRouter)
app.use("/admin", adminRouter)

app.listen(port, () => {
  console.log(`It's running on ${port} server`);
})

