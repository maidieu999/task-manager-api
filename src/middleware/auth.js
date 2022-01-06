const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        // console.log(token) 
        // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MWQxYjdkNTRmNGZmYjJhYmNjYzRkMTciLCJpYXQiOjE2NDExMzg3NDUsImV4cCI6MTY0MTc0MzU0NX0.rp1eUgK5Sh5zZwn7xi83k1CQCm5MzDO3qSApUoJ6kBE
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        // console.log(decodedToken) 
        // { _id: '61d1b7d54f4ffb2abccc4d17', iat: 1641138745, exp: 1641743545 }

        const user = await User.findOne({ _id: decodedToken._id, 'tokens.token': token })
        if(!user) {
            throw new Error()
        }
        req.token = token
        req.user = user
        next()
    } catch (error) {
        res.status(404).send({ error: 'Please authenticate!'})
    }
}

module.exports = auth