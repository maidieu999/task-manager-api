const express = require('express')

require('./db/mongoose') // ket noi database
const userRouter = require('../src/router/user')
const taskRouter = require('../src/router/task')

const app = express()
const port = process.env.PORT

app.use(express.json()) // conver json response to an object req.body tu json -> object
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ', port)
})
